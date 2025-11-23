import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCompactNumber(number: number): string {
  if (number < 1000) {
    return number.toString();
  } else if (number >= 1000 && number < 1000000) {
    return parseFloat((number / 1000).toFixed(2)) + 'k';
  } else if (number >= 1000000 && number < 1000000000) {
    return parseFloat((number / 1000000).toFixed(2)) + 'M';
  } else {
    return parseFloat((number / 1000000000).toFixed(2)) + 'B';
  }
}
