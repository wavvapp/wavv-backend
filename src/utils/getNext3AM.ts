import {
  addDays,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

export function getNext3AM(timezone: string) {

  const now = toZonedTime(new Date(), timezone);

  let next3AM = setHours(now, 3);
  next3AM = setMinutes(next3AM, 0);
  next3AM = setSeconds(next3AM, 0);
  next3AM = setMilliseconds(next3AM, 0);

  if (now > next3AM) {
    next3AM = addDays(next3AM, 1);
  }

  return next3AM;
}
