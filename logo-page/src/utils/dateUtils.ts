export function convertDateToDDMMYYYY(isoDate: string): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return ""; // Handle invalid date strings
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function parseBackendDate(arr: number[]): Date | null {
  if (!arr || arr.length < 3) return null;
  // Backend date format: [year, month, day, hour, minute, second, nano]
  // Month in JS Date constructor is 0-indexed, so subtract 1
  const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = arr;
  const millisecond = Math.floor(nano / 1_000_000); // Convert nanoseconds to milliseconds
  const date = new Date(year, month - 1, day, hour, minute, second, millisecond);
  return isNaN(date.getTime()) ? null : date; // Return null if date is invalid
}