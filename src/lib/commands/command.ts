/**
 * @author     Noah Sweet
 * @file       command.js
 */

// NodeJS
import * as fs from 'fs';
import { join } from 'path';
import * as discordjs from 'discord.js';

// Base
import { logger } from 'logger';

import { System } from '@lib/systems/systems';
export { System } from '@lib/systems/systems';

// Event Manager
import { Events } from '@lib/events/events';

// Util Imports
import { Hashtable } from '@util/hashtable';

import { Any } from '@util/object';

export type CommandMessageType = { content: string } |
                                 { message: string } |
                                 { context: string } |
                                 { data: string } | Any;

/**
 * Command template class for commands
 */
export class Command {

    private _name: string;
    get name(): string { return this._name; }

    private _description: string;
    get description(): string { return this._description; }

    private action: (event_manager: Events, message: CommandMessageType, ...args: Any[]) => void;

    /**
     * @param {string} name                   Name of the command, this is the part after the prefix, <prefix><name>
     * @param {string} description            Description of the command
     * @param {CallableFunction} callable     A callable object to invoke when the command is typed
     */
    constructor(name: string, description: string, callable: (event_manager: Events, message: CommandMessageType, ...args: Any[]) => void) {
        this._name = name;
        this._description = description;

        this.action = callable;
    }

    /**
     * Executes the command calling the action
     * @param {discordjs.Message} message     The message sent from discord
     * @param {*} args                        Args to pass to the action
     */
    execute(event_manager: Events, message: CommandMessageType, args: Any): void {
        this.action(event_manager, message, ...args);
    }
}


/**
 * Class to find and build commands
 */
export interface CommandInterface {

    commands: Hashtable<Command>;

    /**
     * Finds and loads commands in the commands folder
     */
    build_commands(): void;

    /**
     * Adds a command to the event system
     * @param {Command} command    The command object to register
     */
    add(command: Command): void;

    /**
     * Parses a message to execute a command
     * @param {discordjs.Message} message     Message from discord server
     */
    parse(message: CommandMessageType): void;
}

/**
 * General Bot Config
 */
export interface CommandConfig {
    /**
     * Prefix to commands from a discord server
     */
    prefix: string;

    /**
     * Commands directory on the disk
     */
    commands_dir: string;

    /**
     * Root Dir path
     */
    root: string;
}

/**
 * Class to find and build commands
 */
export class CommandManager extends System implements CommandInterface {

    commands: Hashtable<Command>;

    commands_dir: string;

    prefix: string;

    /**
     * @param {config.Server} command_config     Server config object
     */
    constructor(events: Events, command_config: CommandConfig) {
        super(events, 'CommandManager');

        this.commands = {};
        this.commands_dir = join(command_config.root, command_config.commands_dir);

        this.prefix = command_config.prefix;

        this.build_commands();

        this.events.on('commands::parse', (message) => {
            this.parse(message);
        });

        this.events.on('commands::add', (command: Command) => {
            this.add(command);
        });

        this.events.on('commands::get-prefix', () => { return this.prefix });
    }

    /**
     * Finds and loads commands in the commands folder
     */
    build_commands(): void {
        const files = fs.readdirSync(this.commands_dir).filter(file => file.endsWith('.js'));

        logger.debug(files);

        for (const file of files) {
            import(this.commands_dir + file).then(command => {
                if (command === undefined || command.default === undefined) {
                    return;
                }

                this.add(command.default);
            });
        }
    }

    /**
     * Adds a command to the event system
     * @param {Command} command    The command object to register
     */
    add(command: Command): void {
        if (command.name === undefined) {
            return;
        }

        logger.debug(command.name);
        
        this.commands[command.name] = command;
    }

    /**
     * Parses a message to execute a command
     * @param {discordjs.Message} message     Message from discord server
     */
    parse(message: discordjs.Message): void {
        if (message.content.startsWith(this.prefix) === false || message.author.bot) {
            return;
        }

        const args: string[] = message.content.slice(this.prefix.length).trim().split(/ +/);
        const command: string | undefined = args.shift();

        if (command === undefined || this.commands[command] === undefined) {
            return;
        }

        try {
            logger.log(`[COMMANDS] Executing: ${command}`);

            if (Array.isArray(args) === true) {
                this.commands[command].execute(this.events, message, args);
            }
            else {
                this.commands[command].execute(this.events, message, args);
            }
        }
        catch (error) {
            logger.error(error);
            message.reply(error.toString());
        }
    }
}

