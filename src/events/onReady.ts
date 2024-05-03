import { Client, TextChannel, REST, Routes, ActivityType } from 'discord.js';
import logger from '../utils/logger';
import { logToChannel } from '../utils/logToChannel';

export function onReady(client: Client) {
    client.once('ready', async () => {
        if (client.user) {
            logger.info(`Ready! Logged in as ${client.user.tag}`); // Use Pino logger
            client.user.setPresence({
                activities: [{ name: 'The Universe', type: ActivityType.Watching }],
                status: 'online'
            });
            await logToChannel(client, `Logged in as ${client.user.tag}`);
        }
    });
}