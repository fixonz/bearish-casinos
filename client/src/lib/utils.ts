import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency
 * @param value The number to format
 * @param currency The currency code (default: USD)
 * @param decimals The number of decimal places (default: 2)
 * @returns The formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = "USD",
  decimals: number = 2
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats a number with a specific number of decimal places
 * @param value The number to format
 * @param decimals The number of decimal places (default: 2)
 * @returns The formatted number string
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Truncates a string to a specific length and adds an ellipsis
 * @param str The string to truncate
 * @param length The maximum length of the string (default: 50)
 * @returns The truncated string
 */
export function truncateString(str: string, length: number = 50): string {
  if (str.length <= length) {
    return str;
  }
  return str.slice(0, length) + "...";
}

/**
 * Formats a date in a human-readable format
 * @param date The date to format
 * @param options The Intl.DateTimeFormatOptions (default: { month: 'short', day: 'numeric', year: 'numeric' })
 * @returns The formatted date string
 */
export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
): string {
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Formats a date as a relative time string (e.g., "2 days ago")
 * @param date The date to format
 * @returns The relative time string
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
}

/**
 * Formats an address for display (truncates middle)
 * @param address The address to format
 * @returns The formatted address string
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Creates a random identifier
 * @returns A random ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
