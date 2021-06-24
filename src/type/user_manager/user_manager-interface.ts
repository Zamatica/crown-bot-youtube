/**
 * @author     Noah Sweet
 * @file       user_manager-interface.ts
 *
 * @package
 */

import { Hashtable } from '@util/hashtable';

export interface UserIDInterface {
    /**
     * Discord Related data
     */
    id: string | number,
}


/**
 * A Serialized User object
 */
export interface UserInterface extends UserIDInterface {   

    /**
     * Time when the bot saw the User
     */
    creation: number,
}


/**
 * A User Manager Class
 *     Tracks user data in memory
 *     User data consist of time connected, level, and total_time connected
 */
export interface UserManagerInterface {
    /**
     * Local user table cached from the database
     */
    cache: Hashtable<UserInterface>;

    /**
     * Temporary Database
     */
    file_db: Hashtable<UserInterface>;

    /**
     * Serailizes the UserManager's user data
     * @returns {*}     Serialized User Data
     */
    serialize(): Hashtable<UserInterface>;

    /**
     * Reads in data from a Serializer
     * @param {*} users_db      User data read from the DB file.
     */
    deserialize(users_db: Hashtable<UserInterface>): void;

    /**
     * Creates a cached User, loads it from the DB if it exist
     * @param {discordjs.User} user      The user to get from the db
     * @returns {User?}                  The user from the db with an updated discord member
     */
    create_user(user: UserIDInterface): UserInterface;

    /**
     * Gets a user from the db or creates one in the db
     * @param {discordjs.User} user    Discord.js user to index with
     * @returns {User}                 Reference to user in the db
     */
    get_user(user: UserIDInterface): UserInterface;

    /**
     * Gets a user from the cache and updates the discord member
     * @param {discordjs.User} discord_user      The user to get from the db
     * @returns {User?}                  The user from the db with an updated discord member
     */
    get_user_from_cache(discord_user: UserIDInterface): UserInterface | undefined;

    /**
     * Gets a user from the DB if it exist
     * @param {discordjs.User} discord_user    Discord.js User
     * @returns {User}                         Reference to user in the db
     */
    get_user_from_db(discord_user: UserIDInterface): UserInterface;

    /**
     * Checks if a user is in cache or the db. Does the lookup by username
     * @param             {string}  username       Name of the user to lookup
     * @returns {User | undefined}                 Reference to user in cache, if it exist
     */
    lookup_user_by_name(username: string): UserInterface | undefined;

    /**
     * Checks if a user is in cache. Does the lookup by username
     * @param             {string}  username      Name of the user to lookup
     * @returns {User | undefined}                Reference to user in cache, if it exist
     */
    lookup_user_from_cache_by_name(username: string): UserInterface | undefined;

    /**
     * Checks if a user is in db. Does the lookup by username 
     * @param             {string}  username       Name of the user to lookup
     * @returns {User | undefined}                 Reference to user in cache, if it exist 
     */
    lookup_user_from_db_by_name(username: string): UserInterface | undefined;
}