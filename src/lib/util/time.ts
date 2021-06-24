/**
 * @author     Noah Sweet
 * @file       time.ts
 */

/**
 * Wrapper type around number
 */
export type time_t = number;


/**
 * Clock time interface for storing HH:MM:SS
 */
export interface ClockTime {
    hours: time_t;
    
    minutes: time_t;
    
    seconds: time_t;
}

