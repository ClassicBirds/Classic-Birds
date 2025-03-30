import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"; // Import the UTC plugin
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
export function unixToDate(unix: number, format = "D MMM"): string {
  return dayjs.unix(unix).utc().format(format);
}

export function unixToDateFull(unix: number, format = "MMM D, YYYY"): string {
  return dayjs.unix(unix).utc().format(format);
}


export function unixToFullDate(unix: number, format = "YYYY-MM-DD"): string {
  return dayjs.unix(unix).utc().format(format);
}

export function unixToHTime(unix: number, format = "h:mm A"): string {
  return dayjs.unix(unix).local().format(format);

}

export const formatTime = (unix: string, buffer?: number) => {
  const now = dayjs();
  const timestamp = dayjs.unix(parseInt(unix)).add(buffer ?? 0, "minute");

  const inSeconds = now.diff(timestamp, "second");
  const inMinutes = now.diff(timestamp, "minute");
  const inHours = now.diff(timestamp, "hour");
  const inDays = now.diff(timestamp, "day");

  if (inMinutes < 1) {
    return "recently";
  }

  if (inHours >= 24) {
    return `${inDays} ${inDays === 1 ? "day" : "days"} ago`;
  } else if (inMinutes >= 60) {
    return `${inHours} ${inHours === 1 ? "hour" : "hours"} ago`;
  } else if (inSeconds >= 60) {
    return `${inMinutes} ${inMinutes === 1 ? "minute" : "minutes"} ago`;
  } else {
    return `${inSeconds} ${inSeconds === 1 ? "second" : "seconds"} ago`;
  }
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);

  return formattedDate;
};

export const formateHexday = (timestamp: number): string => {
  return Math.ceil(timestamp / 86400 - 18233).toString();
};

export const hexDayToTimestamp = (hexDay:string) => {
  const timestamp = (Number(hexDay) + 18233) * 86400;
  return timestamp ; // Convert to milliseconds
};


export function useDeltaTimestamps(): [number, number, number] {
  const utcCurrentTime = dayjs()
  const t1 = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()
  const t2 = utcCurrentTime.subtract(2, 'day').startOf('minute').unix()
  const tWeek = utcCurrentTime.subtract(1, 'week').startOf('minute').unix()
  return [t1, t2, tWeek]
}

