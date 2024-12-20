import {
    addDays,
    setHours,
    setMilliseconds,
    setMinutes,
    setSeconds,
} from "date-fns";

export function getNext3AM(currentDate = new Date()) {
  let next3AM = setHours(currentDate, 3);
  next3AM = setMinutes(next3AM, 0);
  next3AM = setSeconds(next3AM, 0);
  next3AM = setMilliseconds(next3AM, 0);

  if (currentDate > next3AM) {
    next3AM = addDays(next3AM, 1);
  }

  return next3AM;
}
