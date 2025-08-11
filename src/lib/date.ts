import { format, formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";

export const formatRo = (date: Date | number, fmt = "PPP") => format(date, fmt, { locale: ro });

export const inRoTz = (date: Date | number, timeZone: string = "Europe/Bucharest") => toZonedTime(date, timeZone);

export const fromNowRo = (date: Date | number) => formatDistanceToNow(date, { addSuffix: true, locale: ro });
