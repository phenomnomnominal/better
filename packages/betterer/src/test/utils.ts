export function checkBaseName(input: unknown, name: string): boolean {
  if (input && (input as FunctionConstructor).name === name) {
    return true;
  }
  const proto: unknown = Object.getPrototypeOf(input);
  if (proto == null) {
    return false;
  }
  return checkBaseName(proto, name);
}
