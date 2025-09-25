
import { parseISO, format, addMonths, isValid, getDaysInMonth } from "date-fns";

/**
 * Check if a string is a valid ISO date
 */
export function isValidISO(iso) {
  if (!iso || typeof iso !== 'string') return false;
  try {
    const date = parseISO(iso);
    return isValid(date);
  } catch {
    return false;
  }
}

/**
 * Safely parse a due date, returning null for invalid dates
 */
export function safeDueDate(iso) {
  if (!isValidISO(iso)) return null;
  try {
    return parseISO(iso);
  } catch {
    return null;
  }
}

/**
 * Safely format a date, returning fallback for invalid dates
 */
export function safeDateFormat(iso, formatStr, fallback = 'N/A') {
  const date = safeDueDate(iso);
  if (!date) return fallback;
  try {
    return format(date, formatStr);
  } catch {
    return fallback;
  }
}

/**
 * Advance due date by one month, preserving day and clamping for short months
 */
export function advanceDueDatePreserveDay(iso) {
  if (!isValidISO(iso)) return null;
  
  try {
    const currentDate = parseISO(iso);
    const nextMonthDate = addMonths(currentDate, 1);
    
    const originalDay = currentDate.getDate();
    const daysInNextMonth = getDaysInMonth(nextMonthDate);
    
    if (originalDay > daysInNextMonth) {
      nextMonthDate.setDate(daysInNextMonth);
    } else {
      nextMonthDate.setDate(originalDay);
    }
    
    return nextMonthDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('[advanceDueDatePreserveDay]', error);
    return null;
  }
}

/**
 * Check if a date is within a range safely
 */
export function isDateWithinRange(iso, startDate, endDate) {
  const date = safeDueDate(iso);
  if (!date) return false;
  
  try {
    return date >= startDate && date <= endDate;
  } catch {
    return false;
  }
}
