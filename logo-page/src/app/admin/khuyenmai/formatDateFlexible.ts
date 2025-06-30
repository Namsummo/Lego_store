import { format } from "date-fns";

export function formatDateFlexible(
  date: string | number[] | undefined | null
): string {
  if (!date) return "";
  if (Array.isArray(date)) {
    // Xử lý kiểu mảng số
    const [y, m, d, h = 0, min = 0, s = 0, nano = 0] = date;
    const dt = new Date(y, m - 1, d, h, min, s, Math.floor(nano / 1_000_000));
    return format(dt, "dd-MM-yyyy HH:mm:ss");
  }
  // Xử lý kiểu string
  const dt = new Date(date);
  if (isNaN(dt.getTime())) return "";
  return format(dt, "dd-MM-yyyy HH:mm:ss");
}
