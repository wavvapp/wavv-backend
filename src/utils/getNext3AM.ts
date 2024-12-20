import {
  addDays,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { BERLIN_TIMEZONE } from "../constants/timezone";

export function getNext3AM() {

  const nowInBerlin = toZonedTime(new Date(), BERLIN_TIMEZONE);

  let next3AM = setHours(nowInBerlin, 3);
  next3AM = setMinutes(next3AM, 0);
  next3AM = setSeconds(next3AM, 0);
  next3AM = setMilliseconds(next3AM, 0);

  if (nowInBerlin > next3AM) {
    next3AM = addDays(next3AM, 1);
  }

  return next3AM;
}
