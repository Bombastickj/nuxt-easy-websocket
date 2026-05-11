import { parseSync } from 'oxc-parser'
import type { ParserOptions } from 'oxc-parser'

/* ---------------------------------- utils --------------------------------- */
function extToLang(filename: string): ParserOptions['lang'] {
  if (filename.endsWith('.d.ts')) return 'dts'
  if (filename.endsWith('.tsx')) return 'tsx'
  if (filename.endsWith('.ts')) return 'ts'
  if (filename.endsWith('.jsx')) return 'jsx'
  return 'js'
}

function normalizeType(text: string) {
  const lines = text.split(/\r?\n/)
  if (lines.length <= 1) return text.trim()

  // Find minimum indentation of non-empty lines
  const minIndent = lines
    .filter(line => line.trim().length > 0)
    .reduce((min, line) => {
      const match = line.match(/^(\s*)/)
      return match ? Math.min(min, match[1]?.length ?? min) : min
    }, Infinity)

  return lines
    .map(line => line.slice(minIndent === Infinity ? 0 : minIndent))
    .join('\n      ') // Body of multi-line should be indented further
    .trim()
}

function ensureBraced(text: string) {
  let t = text.trim()

  // remove one leading { … and one trailing … }
  if (t.startsWith('{')) t = t.slice(1)
  if (t.endsWith('}')) t = t.slice(0, -1)

  const normalized = normalizeType(t)
  if (normalized.includes('\n')) {
    return `{\n      ${normalized}\n    }`
  }
  return `{ ${normalized} }`
}

/* --------------------------- oxc-parser extraction ------------------------- */

/**
 * Extract generic from:
 *   export default defineEasyWSEvent<...>(...)
 *   export default defineEasyWSConnection<...>(...)
 */
export function extractGenericFromFile(filename: string, code: string) {
  // Prefer TypeScript-flavored AST where possible.
  const lang = extToLang(filename)
  const opts: ParserOptions = {
    lang, // 'js' | 'jsx' | 'ts' | 'tsx' | 'dts'
    sourceType: 'module',
    astType: lang === 'js' || lang === 'jsx' ? 'js' : 'ts',
    range: true,
    preserveParens: true,
    showSemanticErrors: false,
  }

  const { program } = parseSync(filename, code, opts)

  // index local type/interface declarations
  type LocalMeta =
    | { kind: 'interface'; range: [number, number] } // interface body (members only)
    | { kind: 'alias'; range: [number, number]; isLiteral: boolean } // alias RHS

  const locals = new Map<string, LocalMeta>()

  // Index local declarations
  for (let node of program.body) {
    if (node.type === 'ExportNamedDeclaration' && node.declaration) {
      node = node.declaration
    }

    if (
      node.type === 'TSInterfaceDeclaration' &&
      node.id?.type === 'Identifier'
    ) {
      // oxc's TSInterfaceBody.range usually excludes the outer { }
      const body = node.body
      const range = body.range
      if (range) locals.set(node.id.name, { kind: 'interface', range })
    }

    if (
      node.type === 'TSTypeAliasDeclaration' &&
      node.id?.type === 'Identifier'
    ) {
      const anno = node.typeAnnotation
      const range = anno.range
      const isLiteral = anno?.type === 'TSTypeLiteral'
      if (range) locals.set(node.id.name, { kind: 'alias', range, isLiteral })
    }
  }

  // Find: export default someFunction<...>(...)
  for (const stmt of program.body) {
    if (stmt.type !== 'ExportDefaultDeclaration') continue

    const decl = stmt.declaration
    if (!decl || decl.type !== 'CallExpression') continue

    // TS generic args:
    const tp = decl.typeArguments
    const first = tp?.params?.[0]
    if (!first) return 'undefined'

    const slice = (rng: [number, number]) => {
      return code.slice(rng[0], rng[1])
    }

    // Inline literal: { ... }
    if (first.type === 'TSTypeLiteral' && first.range) {
      return ensureBraced(slice(first.range))
    }

    // Reference: <Foo>
    if (first.type === 'TSTypeReference') {
      const tn = first.typeName
      const ident = tn.type === 'Identifier' ? tn.name : 'undefined'

      // Complex qualified names: just return source text if possible
      if (!ident) return first.range ? slice(first.range) : 'undefined'

      // External/builtin or auto-imported type → keep full reference incl. generics
      const local = locals.get(ident)
      if (!local) {
        return first.range ? normalizeType(slice(first.range)) : ident
      }

      if (local.kind === 'interface') {
        // Interface body range is members-only → add braces
        return ensureBraced(slice(local.range))
      }

      if (local.kind === 'alias') {
        const text = slice(local.range)
        // If alias RHS is a literal, ensure braces; otherwise return as-is
        return local.isLiteral ? ensureBraced(text) : normalizeType(text)
      }
    }

    // Fallback: return raw source for the type node, if we have a range
    if (first.range) return normalizeType(slice(first.range))
    return 'undefined'
  }
  return null
}
