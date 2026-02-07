/**
 * Constants for driver trip assignment system
 * These values control how driver availability and earliest booking times are calculated
 */

/** Wait time at pickup location (in minutes) */
export const PICKUP_WAIT_TIME_MINUTES = 15;

/** Buffer time added after travel calculations (in minutes) */
export const TRAVEL_BUFFER_MINUTES = 15;

/** Time slot rounding increment (in minutes) */
export const TIME_SLOT_ROUNDING_MINUTES = 15;

/**
 * Only run "travel from previous destination to new pickup" check when the new
 * booking start is within this many minutes after the previous booking end.
 */
export const MAX_GAP_MINUTES_FOR_TRAVEL_CHECK = 60;
