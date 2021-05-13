const parseDigits = (value: string): string => (value.match(/\d+/g) || []).join('');

export const strToDigitArray = (value: string): number[] => value.match(/\d/g)?.map((value: string) => parseInt(value, 10)) || [];

export const sumIntArray = (digits: number[]) => digits.reduce((prev: number, curr: number) => (prev + curr), 0);

export const formatDate = (value: string): string => {
  const digits = parseDigits(value);
  const chars = digits.split('');
  return chars
    .reduce(
      (r: string, v: string, index: number) => (index === 2 || index === 4 ? `${r}.${v}` : `${r}${v}`),
      ''
    )
    .substr(0, 10);
};

export const formatDateWithAppend = (value: string): string => {
  const res = formatDate(value);

  if (value.endsWith('.')) {
    if (res.length === 2) {
      return `${res}.`;
    }

    if (res.length === 5) {
      return `${res}.`;
    }
  }

  return res;
};


export const appendDot = (value: string): string => (value.length === 2 || value.length === 5 ? `${value}.` : value);
