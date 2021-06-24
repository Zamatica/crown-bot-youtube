/**
 * @author     Noah Sweet
 * @file       command_manager.js
 */

// Base Imports
import { logger } from 'logger';

// Util Imports
import { Hashtable } from '@util/hashtable';
import { Any } from '@util/object';

/**
 * An Event managed by the Event
 */
export class Event {
    private _name: string;
    private _action: CallableFunction;

    /**
     * @returns {string}     The Name of the event
     */
    get name(): string { return this._name; }

    /**
     * @param {string} name                 The name of the event
     * @param {CallableFunction} action     What do to when the event is trigger
     */
    constructor(name: string, action: (...args: Any[]) => Any) {
        this._name = name;
        this._action = action;
    }

    /**
     * Executes the action passing args
     * @param  {...any} args                Any args needed by the action
     * @returns {Any | void}                Returns results, if any, from the event
     */
    execute(args: Any[]): Any | void {
        return this._action(...args);
    }
}


/**
 * Manages the events for the bot
 */
export abstract class Events implements Events {

    /**
     * Hashtable of registered Events
     */
    private events: Hashtable<Event>;


    /**
     * Creates EventManager
     */
    constructor() {
        this.events = {};
    }

    /**
     * Checks if an event exist
     * @param {string} event_name     The event to check
     * @returns {boolean}             If the event exist, true => it exist, false => does not exist
     */
    check(event_name: string): boolean {
        return this.events[event_name] !== undefined;
    }

    /**
     * Registers a new event with the manager; If the event_name exist, does nothing.
     * @param {string} event_name                 The name of the event
     * @param {CallableFunction} action     What do to when the event is trigger
     */
    on(event_name: string, action: (...args: Any[]) => Any | void): void {
        if (this.events[event_name] !== undefined) {
            logger.warn(`[EVENTS] Duplicate event_name: ${event_name}`);
            return;
        }

        this.events[event_name] = new Event(event_name, action);
    }

    /**
     * Executes an event if it exist
     * @param {string} event_name     Name of the event to register
     * @return {Any | void}           Returns results, if any, from the event
     */
    emit(event_name: string, ...args: Any[]): Any | void {
        const event: Event = this.events[event_name];

        if (event !== undefined) {
            return event.execute(args);
        }

        else {
            logger.error(`No event named: ${event_name} was found.`);
        }
    }
}

/**
 * General Purpose Events
 */
export class GenericEventManager extends Events {}

