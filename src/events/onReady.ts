import { Client, REST, Routes, ActivityType } from 'discord.js';
import logger from '../utils/logger';
import { logToChannel } from '../utils/logToChannel';
import commands from '../handlers/commandHandler';
import Config from '../config';

export function onReady(client: Client) {
  client.once('ready', async () => {
    if (client.user) {
      logger.info(`Ready! Logged in as ${client.user.tag}`);
      client.user.setPresence({
        activities: [{ name: 'The Universe', type: ActivityType.Watching }],
        status: 'online',
      });
      await logToChannel(client, `Logged in as ${client.user.tag}`);

      const rest = new REST({ version: '10' }).setToken(Config.DISCORD_TOKEN);

      try {
        logger.info('Started refreshing application (/) commands.');

        const body = Array.from(commands.values()).map(command => command.data.toJSON());
        
        await rest.put(
          Routes.applicationCommands(client.user.id),
          { body },
        );

        logger.info('Successfully reloaded application (/) commands.');
      } catch (error) {
        logger.error('Failed to reload application (/) commands:', error);
      }
    }
  });
}
