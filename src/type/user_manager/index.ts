
import { Hashtable } from '@util/hashtable';
import { System } from "@lib/systems/systems";

import { GuildMember } from 'discord.js';

/**
 * A Serialized User object
 */
export interface UserSerialized {

    /**
     * Discord Related data
     */
    id: string,
    name: string,

    /**
     * Debug
     */
    manageable: boolean,

    /**
     * Level of the user
     */
    level: number,
    badge: string,

    /**
     * Time spent connected
     */
    total_time: number,

    /**
     * Time Spent talking
     */
    time_spent_talking: number,
}

export interface User extends UserSerialized {
    /**
     * Updates the total time of a user
     * @param {number} current_time     The current time in seconds
     */
    update_total_time(current_time: number): void;

    /**
     * Reduces the User object to the essential components. Name is included for reading the file.
     * @returns {UserSerialized}     Essential User data to write to disk
     */
    serialize(): UserSerialized;

    /**
     * Reads in data from an object
     * @param {UserSerialized} obj     The object read from the disk to copy data from
     */
    deserialize(user: UserSerialized): void;
}

export interface UserManagerStaticFunctions {
    /**
     * Gets the current time in ms
     * @returns    current time in ms
     */
    get_time(): number;
    
    /**
     * Converts from level to experience
     * @param {number} y     The level of a user
     * @returns              Experience, in seconds, required to get to that level
     */
    level_equation_inverse(y: number): number;

    /**
     * Converts from experience to levels
     * @param {number} x     The experience in seconds to convert
     * @returns              The level as a decimal
     */
    level_equation(x: number): number;

    /**
     * Gets the integer level of a user
     * @param {number} experience     The experience in seconds
     * @returns                       The rounded level of a user
     */
    calculate_level(experience: number): number;
}

export interface UserManager extends System, UserManagerStaticFunctions {
    /**
     * Serailizes the UserManager's user data
     * @returns {*}     Serialized User Data
     */
    serialize(): Hashtable<UserSerialized>;

    /**
     * Reads in data from a Serializer
     * @param {*} users_db      User data read from the DB file.
     */
    deserialize(users_db: Hashtable<UserSerialized>): void;

    /**
     * Gets a user from the db or creates one in the db
     * @param {discordjs.User} user    Discord.js user to index with
     * @returns {User}                 Reference to user in the db
     */
    get_user(user: GuildMember): User;

    /**
     * Checks if a user is in cache or the db. Does the lookup by username
     * @param             {string}  username       Name of the user to lookup
     * @returns {User | undefined}                 Reference to user in cache, if it exist
     */
    lookup_user_by_name(username: string): User | UserSerialized | undefined;
}

