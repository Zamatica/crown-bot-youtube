/**
 * @author     Noah Sweet
 * @file       system.ts
 *
 * @package
 */

// Base Imports
import { logger } from 'logger';

// Event Manager
import { Events } from '@lib/events/events';

import { Hashtable } from '@util/hashtable';

// Util Imports
import { Any } from '@util/object';


/**
 * Base class for a System of the bot
 */
export abstract class System {

    /**
     * Events system to track
     */
    protected events: Events;

    /**
     * Name of the plugin
     */
    name: string;

    /**
     * @param {Events}       events            The event manager to register bot wide events with
     * @param {string}       name              The name of the System
     * @param {boolean}      serialize         Whether to serialize this system
     */
    constructor(events: Events, name: string, serialize: boolean = false) {
        logger.log(`[SYSTEM] Creating ${name} System.`);
        this.events = events;
        this.name = name;

        if (serialize === true) {
            this.events.emit('serialize::register', name, this);
        }
    }

    /**
     * Serializes the System class, removing the event_manager (returns a copy)
     * @returns {System}     The serialized system class without event_manager
     */
    serialize(): Any {
        const clone: Any = { ...this };

        // Remove the event manager from being saved
        delete clone.event_manager;

        return clone;
    }

    /**
     * Default deserialize action
     * @param {any} obj     Object read from a file
     */
    deserialize(obj: Any): void {
        Object.keys(obj).forEach((k: Any) => {
            (this as Any)[k] = obj[k];
        });
    }
}



export interface SystemsInterface {
    systems: Hashtable<System>;

    add(name: string, system: System): void;

    remove(name: string): boolean;


}

