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
