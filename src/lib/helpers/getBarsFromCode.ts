export const getBarsFromCode = (code: number): number => {
  if (code >= 20 && code <= 30) return 4;
  if (code >= 15 && code <= 19) return 3;
  if (code >= 10 && code <= 14) return 2;
  if (code >= 2 && code <= 9) return 1;
  return 0;
};