import * as datefns from 'date-fns';

export function formatDate(value: Date | string, format = 'DD-MM-YYYY') {
  return datefns.format(new Date(value), format);
}

export function formatDateTime(
  value: Date | string,
  format = 'DD-MM-YYYY HH:mm',
) {
  return datefns.format(new Date(value), format);
}

export function formatRelativeDate(value: Date | string) {
  return datefns.formatDistanceToNow(new Date(value));
}
