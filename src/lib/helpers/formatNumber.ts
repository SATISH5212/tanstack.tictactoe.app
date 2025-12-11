import dayjs from "dayjs";

export const formatNumber = (value: number | undefined): number | undefined => {
  if (value === undefined) return undefined;
  return parseFloat(value.toFixed(2));
};
export const formatDateToIST = (date: string | Date): string => {
  return dayjs.utc(date).tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A");
};
