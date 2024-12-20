import { isAfter, isValid, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { BERLIN_TIMEZONE } from '../constants/timezone';

export const isDateExpired = (dateToCheck: Date) => {
  const date = typeof dateToCheck === 'string' ? parseISO(dateToCheck) : dateToCheck;
  
  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }
  
  const nowInBerlin = toZonedTime(new Date(), BERLIN_TIMEZONE);
  return isAfter(nowInBerlin, date);
};
