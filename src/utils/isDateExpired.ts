import { isAfter, isValid, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const isDateExpired = (dateToCheck: Date, timezone: string) => {
  const date = typeof dateToCheck === 'string' ? parseISO(dateToCheck) : dateToCheck;
  
  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }
  
  const nowInBerlin = toZonedTime(new Date(), timezone);
  return isAfter(nowInBerlin, date);
};
