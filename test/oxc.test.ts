import { describe, it, expect } from 'vitest'
import { extractGenericFromFile } from '../src/utils/oxc'

describe('extractGenericFromFile', () => {
  it('should extract inline literal types', () => {
    const code = `
      export default defineEasyWSEvent<{
        foo: string;
        bar: number;
      }>({})
    `
    const result = extractGenericFromFile('test.ts', code)
    expect(result).toBe('{\n      foo: string;\n      bar: number;\n    }')
  })

  it('should extract interface-based types', () => {
    const code = `
      interface MyEvent {
        msg: string;
        timestamp: number;
      }
      export default defineEasyWSEvent<MyEvent>({})
    `
    const result = extractGenericFromFile('test.ts', code)
    expect(result).toBe('{\n      msg: string;\n      timestamp: number;\n    }')
  })

  it('should extract type alias types', () => {
    const code = `
      type MyType = {
        id: string;
      }
      export default defineEasyWSEvent<MyType>({})
    `
    const result = extractGenericFromFile('test.ts', code)
    expect(result).toBe('{ id: string; }')
  })

  it('should extract primitive type aliases', () => {
    const code = `
      type MyID = string;
      export default defineEasyWSEvent<MyID>({})
    `
    const result = extractGenericFromFile('test.ts', code)
    expect(result).toBe('string')
  })

  it('should handle external types', () => {
    const code = `
      import { ExternalType } from './types'
      export default defineEasyWSEvent<ExternalType>({})
    `
    const result = extractGenericFromFile('test.ts', code)
    expect(result).toBe('ExternalType')
  })

  it('should handle generics in external types', () => {
    const code = `
      import { ExternalType } from './types'
      export default defineEasyWSEvent<ExternalType<string>>({})
    `
    const result = extractGenericFromFile('test.ts', code)
    expect(result).toBe('ExternalType<string>')
  })

  it('should extract defineEasyWSConnection generics', () => {
    const code = `
      export default defineEasyWSConnection<{ user: string }>({})
    `
    const result = extractGenericFromFile('test.ts', code)
    expect(result).toBe('{ user: string }')
  })

  it('should return null if no export default defineEasyWSEvent/Connection', () => {
    const code = `
      export const foo = 'bar'
    `
    const result = extractGenericFromFile('test.ts', code)
    expect(result).toBe(null)
  })

  it('should extract exported interface-based types', () => {
    const code = `
      export interface MyEvent {
        msg: string;
      }
      export default defineEasyWSEvent<MyEvent>({})
    `
    const result = extractGenericFromFile('test.ts', code)
    expect(result).toBe('{ msg: string; }')
  })

  it('should extract exported type alias types', () => {
    const code = `
      export type MyType = {
        id: string;
      }
      export default defineEasyWSEvent<MyType>({})
    `
    const result = extractGenericFromFile('test.ts', code)
    expect(result).toBe('{ id: string; }')
  })

  it('should return undefined string if no generic is provided', () => {
    const code = `
      export default defineEasyWSEvent({})
    `
    const result = extractGenericFromFile('test.ts', code)
    expect(result).toBe('undefined')
  })
})
