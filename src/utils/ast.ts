import pathe from 'pathe'
import { Project, Node, ts, SyntaxKind } from 'ts-morph'

import type { CallExpression, Expression, SourceFile, Type as MType, TypeChecker } from 'ts-morph'

interface RenderOptions {
  /** Maximum recursion depth to avoid runaway expansion */
  maxDepth?: number

  /** If we hit a cycle or depth limit, use this as fallback */
  fallbackType?: 'any' | 'unknown' | 'undefined'

  /** Context logger */
  logger?: { warn: (msg: string) => void }
}

/**
 * Build a ts-morph Project that includes:
 * - all files from the solution tsconfig AND its referenced tsconfigs
 */
export function buildProjectForNuxt(tsConfigFilePath: string) {
  const project = new Project({
    // Pull files manually below
    skipAddingFilesFromTsConfig: true,
  })

  const visited = new Set<string>()

  const addTsConfigRecursively = (cfgPath: string) => {
    const abs = pathe.resolve(cfgPath)
    if (visited.has(abs)) return
    visited.add(abs)

    if (!ts.sys.fileExists(abs)) return

    project.addSourceFilesFromTsConfig(abs)

    const read = ts.readConfigFile(abs, ts.sys.readFile)
    const cfg = read.config ?? {}
    const refs: Array<{ path: string }> = cfg.references ?? []

    for (const ref of refs) {
      // Reference can be "dir" or "file.json"
      let refPath = pathe.resolve(pathe.dirname(abs), ref.path)
      if (!refPath.endsWith('.json')) {
        const tryJson = pathe.join(refPath, 'tsconfig.json')
        if (ts.sys.fileExists(tryJson)) refPath = tryJson
      }

      if (ts.sys.fileExists(refPath)) addTsConfigRecursively(refPath)
    }
  }

  // 1) Load solution tsconfig + all its references
  addTsConfigRecursively(tsConfigFilePath)

  // 2) Resolve dependencies
  project.resolveSourceFileDependencies()

  return project
}

/** Resolve `export default defineEasyWSEvent(...` even if it's a bound identifier */
export function getDefaultExportDefineCall(sf: SourceFile): CallExpression | undefined {
  const assign = sf.getExportAssignment(e => !e.isExportEquals())
  if (!assign) return

  let expr = assign.getExpression()
  if (Node.isParenthesizedExpression(expr)) expr = expr.getExpression()

  if (Node.isIdentifier(expr)) {
    const d = expr.getDefinitions()[0]?.getDeclarationNode()
    const init = Node.isVariableDeclaration(d) ? d.getInitializer() : d
    if (init && Node.isParenthesizedExpression(init)) expr = init.getExpression()
    else if (init) expr = init as Expression
  }

  if (!Node.isCallExpression(expr)) return
  const callee = expr.getExpression()
  if (Node.isIdentifier(callee) && (callee.getText() === 'defineEasyWSEvent' || callee.getText() === 'defineEasyWSConnection')) return expr
  return
}

/** Prefer explicit `<T>` */
export function getPayloadType(call: CallExpression): MType | undefined {
  const targs = call.getTypeArguments()
  if (targs.length) return targs[0]!.getType()
  return undefined
}

export function renderTypeStructural(
  type: MType,
  checker: TypeChecker,
  sourceFile: SourceFile,
  options: RenderOptions = {},
  depth = 0,
): string {
  try {
    return _renderTypeStructural(type, checker, sourceFile, options, depth)
  } catch (e: any) {
    const msg =
      `type render failed ` +
      `in ${sourceFile.getBaseName()} | error: ${e?.message ?? e}`

    options.logger?.warn?.(msg) ?? console.warn(msg)
    return options.fallbackType ?? 'undefined'
  }
}

/** Minimal "serializer" mapping for JSONable output */
function coerceSpecials(type: MType): string | undefined {
  const sym = type.getSymbol()
  const name = sym?.getName()

  // Date -> string
  if (name === 'Date') return 'Date'

  // Function/Constructor -> never (not serializable)
  if (type.getCallSignatures().length || type.getConstructSignatures().length) return 'never'

  return undefined
}

function typeToStringNoCut(checker: TypeChecker, t: MType) {
  return checker.compilerObject.typeToString(
    t.compilerType,
    /*enclosingNode*/ undefined,
    ts.TypeFormatFlags.NoTruncation
    | ts.TypeFormatFlags.InTypeAlias
    | ts.TypeFormatFlags.UseFullyQualifiedType,
  )
}

function _renderTypeStructural(
  type: MType,
  checker: TypeChecker,
  sourceFile: SourceFile,
  options: RenderOptions = {},
  depth = 0,
): string {
  const { maxDepth = 50, fallbackType = 'undefined' } = options
  if (depth > maxDepth) return fallbackType

  const coerced = coerceSpecials(type)
  if (coerced) return coerced

  // Primitives and literals
  if (type.isString()) return 'string'
  if (type.isNumber()) return 'number'
  if (type.isBoolean()) return 'boolean'
  if (type.getFlags() & ts.TypeFlags.ESSymbolLike) return 'symbol'
  if (type.isNull()) return 'null'
  if (type.isUndefined()) return 'undefined'
  if (type.isUnknown()) return 'unknown'
  if (type.isVoid()) return 'void'
  if (type.isLiteral()) return typeToStringNoCut(checker, type)

  // Try to use a global/builtin name instead of exploding
  const sfPath = sourceFile.getFilePath()
  const foundSources = (type.getSymbol()?.getDeclarations() ?? []).filter(d => 
    d.getSourceFile().getFilePath() !== sfPath
  ).length > 0
  if (foundSources) return typeToStringNoCut(checker, type)

  // Tuple
  if (type.isTuple()) {
    const args = type.getTupleElements().map(t =>
      renderTypeStructural(t, checker, sourceFile, options, depth + 1),
    )
    return `[${args.join(', ')}]`
  }

  // Array or ReadonlyArray  
  if (type.isArray() || type.isReadonlyArray()) {
    const elem = type.getTypeArguments()[0]

    if (elem) {
      let rendered = renderTypeStructural(elem, checker, sourceFile, options, depth + 1)

      // pretty: (A | B)[]
      if (elem.isUnion()) rendered = `(${rendered})`
      return `${rendered}[]`
    }
  }

  // Union / Intersection
  if (type.isUnion()) {
    return type.getUnionTypes().map(t => renderTypeStructural(t, checker, sourceFile, options, depth + 1)).join(' | ')
  }
  if (type.isIntersection()) {
    return type.getIntersectionTypes().map(t => renderTypeStructural(t, checker, sourceFile, options, depth + 1)).join(' & ')
  }

  // Object-ish (interfaces, aliases, mapped types, anonymous object types, etc.)
  if (type.isObject()) {
    // Use apparent type here to expand many mapped/conditional outcomes into explicit props.
    const obj = type.getApparentType()
    const props = obj.getProperties()
    
    // Index signatures
    const stringIndex = obj.getStringIndexType()
    const numberIndex = obj.getNumberIndexType()
  
    const members: string[] = []
  
    // Handle object named properties
    for (const p of props) {
      const name = p.getName()
  
      // choose a location for accurate optional/readonly detection
      const decl = p.getValueDeclaration() ?? p.getDeclarations()[0]
      decl?.getKind() === SyntaxKind.OptionalType
      const isOptional = !!(p.getFlags() & ts.SymbolFlags.Optional)
        || (!!decl && 'questionToken' in decl && !!(decl).questionToken)
  
      // Resolve property type
      const propType = checker.getTypeOfSymbolAtLocation(p, decl ?? obj.getSymbol()?.getDeclarations()[0] ?? sourceFile)
      const rendered = renderTypeStructural(propType, checker, sourceFile, options, depth + 1)
  
      members.push(`${name}${isOptional ? '?' : ''}: ${rendered};`)
    }
  
    // Handle object index signatures
    if (stringIndex) {
      members.push(`[key: string]: ${renderTypeStructural(stringIndex, checker, sourceFile, options, depth + 1)};`)
    }
    if (numberIndex) {
      members.push(`[index: number]: ${renderTypeStructural(numberIndex, checker, sourceFile, options, depth + 1)};`)
    }
  
    if (members.length > 0) {
      return `{ ${members.join(' ')} }`
    }
  }

  // Ultimate fallback: let TS say something sensible
  // Useful for exotic/opaque conditional types where apparent/props are empty.
  return typeToStringNoCut(checker, type)
}
