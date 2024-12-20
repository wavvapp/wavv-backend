import { isAfter, isValid, parseISO } from 'date-fns';

export const isDateExpired = (dateToCheck: Date) => {
  const date = typeof dateToCheck === 'string' ? parseISO(dateToCheck) : dateToCheck;
  
  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }
  
  const now = new Date();
  return isAfter(now, date);
};
