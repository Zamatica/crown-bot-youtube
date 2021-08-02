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
     * Wrapper around an incoming message
     */
    Message,
    VoiceChannel,
    VoiceConnection
} from 'discord.js';

/**
 * Youtube Downloader
 */
import ytdl from 'ytdl-core'


/**
 * Plugin Related Types
 */
import { 
    /**
     * Discord Server Events API
     */
    DiscordServerManagerEvents
} from '@systems/server';
import { Readable } from 'stream';


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
export default class Youtube extends System {
    
    static IDLE_TIME_LIMIT: number = 1000 * 60 * 0.25;

    /**
     * We can have variables in our Plugins.
     *   These can maintain state, and are Discord Server (Guild) wide
     */
    connection_timer: NodeJS.Timer | null;

    /**
     * 
     */
    play_queue: string[];

    /**
     * Player State
     */
    state: 'isPlaying' | 'stopped' | 'idle';

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
        this.connection_timer = null;
        this.play_queue = [];
        this.state = 'idle';

        /**
         * Some plugins want to add commands to the server for a variety of reasons.
         * 
         * The CommandManager registers some events to allow Plugins to extend 
         * 
         * NOTE: If you register a duplicate command it will overwrite whatever is registered.
         */
        events.emit('commands::add', new Command('play', 'Queues a video.', async (events: DiscordServerManagerEvents, message: Message, query_or_url: string | undefined) => {            
            if (message.member === null) {
                message.reply('Cannot stream in DMs.');
                return;
            }

            await this.execute_queue(message, message.member.voice.channel, query_or_url);
        }));
    }

    private async execute_queue(message: Message, channel: VoiceChannel | null, query_or_url: string | undefined): Promise<void> {        
        if (query_or_url === undefined) {
            message.reply('Usage: play <url>');
            return;
        }

        if (channel === null) {
            message.reply('Please join a Voice channel on this Server.');
            return;
        }

        if (channel.joinable === false) {
            message.reply(`Cannot join channel: ${channel.name}`);
            return;
        }

        this.play_queue.push(query_or_url);
        message.reply(`Added: ${query_or_url}`);

        if (this.state === 'idle' || this.state === 'stopped') {
            this.state = 'isPlaying';
            await this.stream_audio(message, channel);
        }
    }

    private async stream_audio(message: Message, channel: VoiceChannel): Promise<void> {
        const query_or_url: string | undefined = this.play_queue.shift();

        if (query_or_url === undefined || this.state === 'stopped') {
            logger.log(`[YOUTUBE] Exiting Loop. Reason: { ${query_or_url ? this.state  : 'No more videos'} }`);
            this.set_leave_timer(channel);
            this.state = 'idle';
            return;
        }

        this.clear_timer();

        const audio: Readable | null = this.find_video(query_or_url);

        if (audio === null) {
            message.reply('Error 01: Invalid video link. Cannot search youtube at this time.');
            return;
        }

        const connection: VoiceConnection = await this.connect(channel);

        audio.on('end', () => {
            this.stream_audio(message, channel);
        });

        this.play(connection, audio);
    }

    private set_leave_timer(channel: VoiceChannel): void {
        this.connection_timer = setTimeout(() => {
            this.leave_channel(channel);
        }, Youtube.IDLE_TIME_LIMIT);
    }

    private clear_timer() {
        if (this.connection_timer === null) {
            return;
        }

        clearTimeout(this.connection_timer);
    }

    private join_channel(channel: VoiceChannel): Promise<VoiceConnection> {        
        return channel.join();
    }

    private async connect(channel: VoiceChannel): Promise<VoiceConnection> {
        logger.log(`[YOUTUBE][VOICE] Connecting to { ${channel.guild.name} }:{ ${channel.name} }`);
        return await this.join_channel(channel);
    }

    private leave_channel(channel: VoiceChannel): void {
        console.log(`[YOUTUBE] Leaving Channel: { ${channel.guild.name} }:{ ${channel.name} }`);
        channel.leave();
    }

    private find_video(query_or_url: string): Readable | null {
        function handle_url(url: string): Readable {
            return ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
        }

        if (ytdl.validateURL(query_or_url) === true) {
            return handle_url(query_or_url);
        }
        /*else {
            return await this.handle_query(query_or_url);
        }*/

        return null;
    }

    private play(connection: VoiceConnection, audio: Readable): void {
        connection.on('error', (error: Error) => {
            logger.error(`[YOUTUBE][VOICE] Error: ${error.message}`);
        });

        connection.play(audio);
    }

    private stop(channel: VoiceChannel, message: Message) {
        message.channel.send('[YOUTUBE] No videos in queue. Finishing...');
        this.state = 'stopped';
    }
}

