export function arraySwap<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();

  newArray[from] = array[to];
  newArray[to] = array[from];

  return newArray;
}

export function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}
