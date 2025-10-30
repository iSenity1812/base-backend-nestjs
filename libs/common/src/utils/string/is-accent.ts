export const isAccent = (str: string): boolean => {
  const accentRegex = /[À-ž]/;
  return accentRegex.test(str);
};
