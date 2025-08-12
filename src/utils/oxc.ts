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

function ensureBraced(text: string) {
  let t = text.trim()

  // remove one leading { … and one trailing … }
  t = t.replace(/^\{\s*/, '')
  t = t.replace(/\s*\}$/, '')

  return `{ ${t} }`
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
  type LocalMeta
    = { kind: 'interface', range: [number, number] } // interface body (members only)
      | { kind: 'alias', range: [number, number], isLiteral: boolean } // alias RHS

  const locals = new Map<string, LocalMeta>()

  // Index local declarations
  for (const node of program.body) {
    if (node.type === 'TSInterfaceDeclaration' && node.id?.type === 'Identifier') {
      // oxc's TSInterfaceBody.range usually excludes the outer { }
      const body = node.body
      const range = body.range
      if (range) locals.set(node.id.name, { kind: 'interface', range })
    }

    if (node.type === 'TSTypeAliasDeclaration' && node.id?.type === 'Identifier') {
      const anno = node.typeAnnotation
      const range = anno.range
      const isLiteral = anno?.type === 'TSTypeLiteral'
      if (range) locals.set(node.id.name, { kind: 'alias', range, isLiteral })
    }
  }

  // Find: export default defineEasyWSEvent<...>(...)
  for (const stmt of program.body) {
    if (stmt.type !== 'ExportDefaultDeclaration') continue

    const decl = stmt.declaration
    if (!decl || decl.type !== 'CallExpression') continue

    // callee must be defineEasyWSEvent
    const callee = decl.callee
    const name
      = callee.type === 'Identifier'
        ? callee.name
        : callee.type === 'MemberExpression' && callee.property.type === 'Identifier'
          ? callee.property.name
          : null
    if (name !== 'defineEasyWSEvent' && name !== 'defineEasyWSConnection') continue

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
        return first.range ? slice(first.range) : ident
      }

      if (local.kind === 'interface') {
        // Interface body range is members-only → add braces
        return ensureBraced(slice(local.range))
      }

      if (local.kind === 'alias') {
        const text = slice(local.range)
        // If alias RHS is a literal, ensure braces; otherwise return as-is
        return local.isLiteral ? ensureBraced(text) : text
      }
    }

    // Fallback: return raw source for the type node, if we have a range
    if (first.range) return slice(first.range)
    return 'undefined'
  }
  return 'undefined'
}
