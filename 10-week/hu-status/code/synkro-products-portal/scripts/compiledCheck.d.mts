export interface CompiledFile {
  name: string
  text: string
}

export interface Violation {
  file: string
  rule: 'gateway-url' | 'token-handling' | 'direct-http'
}

export const RULES: { rule: Violation['rule']; patterns: RegExp[] }[]
export function findViolations(files: CompiledFile[]): Violation[]
export function readCompiled(directory: string): CompiledFile[]
