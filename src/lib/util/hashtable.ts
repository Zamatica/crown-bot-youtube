/**
 * @author     Noah Sweet
 * @file       hashtable.ts
 */

/**
 * Interface Wrapper around {} to denote hashtable indexing
 */
export interface Hashtable<T> { [key: string]: T }

/**
 * Interface Wrapper around {} to denote hashtable indexing with numbers
 */
export interface NumberHashtable<T> { [key: number]: T }

