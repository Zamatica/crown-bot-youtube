/**
 * @author     Noah Sweet
 * @file       plugin.ts
 *
 * @package
 */


/**
 * Util Imports
 */
import { Hashtable } from '@util/hashtable';

/**
 * Logger
 */
import { logger } from '@lib/logger/logger';
import { System } from '@lib/systems/systems';


export interface Plugin {
    name: string;
}

export class RemotePlugin<T> {
    
    /**
     * 
     */
    url: string;
    
    /**
     * A remote plugin to load
     * @param {string} url     Url to load the plugin from
     */
    constructor(url: string) {
        this.url = url;
    }

    load_git(url: string, folder: string = 'src', folder_ignore_list: [string] = ['lib']): void {
        logger.log('Loading Plugin from git:')
    }

    load_text(url: string): void {
        logger.log(`Loading Plugin from Remote Text file: ${url}`);
    }
}


export class Plugins<T extends Plugin> {
    plugins: Hashtable<T>;

    constructor() {
        this.plugins = {};
    }

    load_plugin(url: string): void {
        logger.debug(url);
    }

    add_plugin(plugin: T): void {
        this.plugins[plugin.name] = plugin;
    }
}

