/**
 * @author     Noah Sweet
 * @file       server.ts
 *
 * @package
 */

/**
 * Lib Imports
 */
import { System } from '@lib/systems/systems';
import { Events } from '@lib/events/events';
import { Command } from '@lib/commands/command';
import { User, UserSerialized } from '@type/user_manager';
 

import {
    Message,
    GuildMember,
    VoiceState
} from 'discord.js';


/**
 * 
 */
export interface DiscordServerManagerEvents extends Events {
         
    /**
     * Loads a remote System as a plugin
     * @param {string} event      server::load-remote
     * @param {string} url        The url of the system to load.
     */
    emit(event: 'server::load-remote', url: string): void;

    /**
     * Loads a local system as a plugin
     * @param {string} event      server::load-local
     * @param {System} plugin     The system to add to the Server
     */
    emit(event: 'server::load-local', plugin: System): void;

    /**
     * Registers a callback function to a voice-state change; order is first-come-first-serve
     * @param {string} event                register-voice-state
     * @param {VoiceStateChangeEventFunction} func     The external entry point for responding
     */
    emit(event: 'server::register-voice-state', func: VoiceStateChangeEventFunction): void;

    /**
     * Registers a callback function to a message; order is first-come-first-serve
     * @param {string} event                  register-message
     * @param {MessageSentEventFunction} func     The external entry point for responding
     */
    emit(event: 'server::register-message', func: MessageSentEventFunction): void;

    /**
     * Registers a callback function to a user update; order is first-come-first-serve
     * @param {string} event                register-user-update
     * @param {UserUpdateEventFunction} func     The external entry point for responding
     */
    emit(event: 'server::register-user-update', func: UserUpdateEventFunction): void;

    // UserManager
    
    /**
     * Gets an array of all users
     * @param {string} event     users::get-all
     * @returns {User[]}         Array of all users
     */
    emit(event: 'users::get-all'): User[];
    
    /**
     * Gets a User object from the UserManager
     * @param {string} event         users::get-user
     * @param {GuildMember} user     The discord user to get the User of
     * @returns {User}               The user if it exist
     */
    emit(event: 'users::get-user', user: GuildMember | null): User | null;

    /**
     * Gets a User object from the UserManager
     * @param {string}       event    users::get-user
     * @param {GuildMember}  user     The discord user to get the User of
     * @returns {User}                The user if it exist
     */
    emit(event: 'users::get-user-by-name', user: string): User | UserSerialized | undefined;


    // Command Events

    /**
     * Adds a command to the CommandManager
     * @param {string} event         commands::add
     * @param {Message} command      The command to add to the CommandManager
     */
    emit(event: 'commands::add', command: Command): void;

    /**
     * Gets the command prefix from a server
     * @param {string} event     commands::get-prefix
     * @returns {string}         The server command prefix
     */
    emit(event: 'commands::get-prefix'): string;
}


/**
 * Respond to a VoiceState
 */
export type VoiceStateChangeEventFunction = (old_state: VoiceState, new_state: VoiceState) => void;

/**
 * Respond to a Message
 */
export type MessageSentEventFunction = (message: Message) => void;

/**
 * Respond to a User
 */
export type UserUpdateEventFunction = (member: GuildMember) => void;
 
 