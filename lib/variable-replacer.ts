/**
 * Replace environment variables in text with actual values
 * Variables are in the format {{variableName}}
 */
export function replaceVariables(
  text: string,
  variables: Record<string, string>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

/**
 * Find all variables in text
 */
export function findVariables(text: string): string[] {
  const matches = text.matchAll(/\{\{(\w+)\}\}/g);
  return Array.from(matches, (m) => m[1]);
}

/**
 * Check if text contains any variables
 */
export function hasVariables(text: string): boolean {
  return /\{\{(\w+)\}\}/.test(text);
}
