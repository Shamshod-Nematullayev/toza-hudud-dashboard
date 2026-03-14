export function isNumberValue(value: string): boolean {
  return value.match(/^[0-9]+$/) !== null || value === '';
}
