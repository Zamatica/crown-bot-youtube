/**
 * @author     Noah Sweet
 * @file       example.ts
 */

/**
 * Logger object import
 */
import { logger } from '@lib/logger/logger';

/**
 * System 
 * 
 * A system is a base operational unit in the Bot.
 * All plugins extend from this base class
 */
import { System } from '@lib/systems/systems';

/**
 * Commands allow us to register custom commands relevant to our bot.
 */
import { Command } from '@lib/commands/command';

/**
 * Discord.js Objects
 */
import {
    /**
     * Discord Server
     */
    Guild,

    /**
     * User from a Discord Server
     */
    GuildMember,

    /**
     * State of a GuildMember's Voice
     */
    VoiceState,

    /**
     * Wrapper around an incoming message
     */
    Message
} from 'discord.js';


/**
 * Plugin Related Types
 */
import { 
    /**
     * Discord Server Events API
     */
    DiscordServerManagerEvents,

    /**
     * VoiceStateChange Event Callback Signature
     */
    VoiceStateChangeEventFunction,

    /**
     * Message Event Callback Signature
     */
    MessageSentEventFunction,

    /**
     * User Update Event Callback Signature
     */
    UserUpdateEventFunction
} from '@type/server';


/**
 * Nomenclature for Discord
 * 
 * Users are anyone on Discord.
 *    This is more relevant for whenever a User DMs the bot.
 *    Most interactions with Users are done through GuildMembers.
 * 
 * Guilds are Discord Servers
 *    Example: Henry's Hangout
 *    Plugins operate at the Guild Scope.
 *    All Plugin data is Guild wide, and all commands can be accessed in _every_ guild text channel (unless you filter it)
 * 
 * GuildMember is the User object in a Guild.
 *    GuildMember _is_ a User, but has interacted with the bot through a Guild.
 * 
 * Plugin
 *    A System that extends the CrownBot per Server.
 *    Plugins can do just about anything to the server.
 *       - Moderation
 *       - Play Music
 *       - Change Nicknames/Roles
 *       - Send Messages
 *       - etc etc
 * 
 * From here out, when we refer to Guild we are talking about the CrownBot at the guild scope.
 *    Each CrownBot is going to vary between Guilds based on what the Admins have added
 */


/**
 * Example Plugin for Extending the CrownBot
 * 
 * All Plugins extend System.
 * 
 * System is the base object for any Class that actually does work
 * 
 * Its important to use `export default`
 * 
 */
export default class ExamplePlugin extends System {
    
    /**
     * We can have variables in our Plugins.
     *   These can maintain state, and are Discord Server (Guild) wide
     */
    state: number;

    /**
     * A plugin uses the event system to talk with other parts of the Guild.
     * The System base class needs an event system. In other functions you can refer to the events
     * as this.events
     * 
     * @param {DiscordServerManagerEvents} events     The Guild Event Object
     */
    constructor(events: DiscordServerManagerEvents) {

        /**
         * Init the System base
         */
        super(events,
            /**
             * Name of the Plugin
             */
            'ExampleName',

            /**
             * Should the System register to the serializer.
             * Setting this flag allows you to define serialize() and deserialize() to write/read on restarts.
             */
            false);


        /**
         * Changing the value of state will show up in the Guild scope.
         *    !state // > 0
         *    !state 1 // sets state to 1
         *    !state // > 1
         */
        this.state = 0;

        
        /**
         * There are 3 main events Plugins can use to respond to discord events.
         *    - Voice State Changes
         *    - Messages
         *    - User Updates
         * 
         * Voice State Changes
         *    This event is called whenever someone's voice state is changed.
         *    This includes going joining, leaving, and going live.
         *    (old_state: discordjs.VoiceState, new_state: discordjs.VoiceState): void;
         * 
         * Messages
         *    This event is called whenever a message is sent on a Guild.
         *    (message: discordjs.Message): void;
         * 
         * User Updates
         *    This event is called every so often
         *    (member: discordjs.GuildMember): void;
         * 
         * 
         * Please note, you don't need to define => functions by variables.
         * You can simply just use `emit(..., () => {})`
         * 
         */



        /**
         * Responding to VoiceState changes requires us to accept both the old state and new state as parameters.
         * It is up to you to determine the chain of events that happened to produce a VoiceStateChange
         * 
         * @param {VoiceState} old_state     The previous VoiceState of a User
         * @param {VoiceState} new_state     The new VoiceState of a User
         * 
         * Usefule properites:
         *     .streaming
         *     .speaking
         *     .member -- possibly null
         *     .guild
         *     .channel -- Voice channel of the State change
         */
        const respond_to_voice_state: VoiceStateChangeEventFunction = (old_state: VoiceState, new_state: VoiceState) => {
            // A GuildMember connected to a voice channel
            if (new_state.channel !== null && new_state.member !== null) {
                logger.log(`${new_state.member} connected to ${new_state.channel.name}`);
            }
        }

        /**
         * We register our callback by emitting a 'server::register-voice-state
         */
        events.emit('server::register-voice-state', respond_to_voice_state);


        /**
         * We can register to respond to message events using a callback function matching
         * the MessageSentEventFunction signature.
         * 
         * Useful properties:
         *    .guild -- The guild the message came from
         *    .author -- the User of the message
         * 
         *    ?.member -- The GuildMember that sent the message. null if the message is from a DM
         */
        const respond_to_message: MessageSentEventFunction = (message: Message) => {
            message.reply('Hello from Exampale!');
        };

        /**
         * We Register our callback by emitting a 'server::register-message'
         */
        events.emit('server::register-message', respond_to_message);


        /**
         * Every so often CrownBot looks at VoiceChannels and passes them to the server to operate on.
         * This lets us keep tabs on who is in what channel.
         * 
         * Useful Properties:
         *    .displayName
         *    .name
         *    .id
         *    .fetch(true) -- gets the most recent version of the GuildMember from discord
         *    .hasPermission
         * 
         * Useful Events:
         *    emit(users::get-user, member)
         *    emit(users::get-user-by-name, 'name')
         */
        const respond_to_user_update: UserUpdateEventFunction = (member: GuildMember) => {
            logger.log(member.displayName);
        }

        /**
         * We register our callback by emitting 'server::register-user-update'
         */
        events.emit('server::register-user-update', respond_to_user_update);

        
        /**
         * Some plugins want to add commands to the server for a variety of reasons.
         * 
         * The CommandManager registers some events to allow Plugins to extend 
         * 
         * NOTE: If you register a duplicate command it will overwrite whatever is registered.
         */
        const commands: Command[] = [
            new Command('example', 'Example command to show how to load commands', (events: DiscordServerManagerEvents, message: Message) => {
                message.channel.send('Example Message Sent!');
            }),

            new Command('example-reply', 'Example command to show how to load commands', (events: DiscordServerManagerEvents, message: Message) => {                
                message.reply('Example Reply!');
            }),
        ]

        /**
         * We register new commands by emitting commands::add with the new Command as the parameter.
         * 
         * The array is used to show that multiple commands can be added
         */
        commands.map(cmd => { 
            events.emit('commands::add', cmd);
        });
    }
}

