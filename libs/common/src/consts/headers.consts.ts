/**
 *  N.B! should be in lower-case because: Nest/axios transforms header from upper to lower
 * and if we can't use native Request methods to retrieve it with transform into some
 * 'universal'-case we will retrieve hardly and can missed if somewhere upper-case was used
 */
export const HEADER_REQUEST_ID = 'x-req-uuid'
export const HEADER_SESSION_ID = 'x-session-uuid'
export const HEADER_TIME_ENTRY = 'x-time-entry'
export const HEADER_TIMESTAMP_ENTRY = 'x-timestamp-entry'
export const HEADER_TIMESTAMP_EXIT = 'x-timestamp-exit'
export const HEADER_TIME_EXECUTE = 'x-time-execute'
