import { Client, REST, Routes, ActivityType } from 'discord.js';
import logger from '../utils/logger';
import { logToChannel } from '../utils/logToChannel';
import commands from '../handlers/commandHandler';
import config from '../config';
import { setupContinuousCheck, postUpdatesToChannel, fetchDataFromAPI } from '../services/tzone-service';

async function registerCommands(client: Client) {
  if (!client.user) return;

  const rest = new REST().setToken(config.DISCORD_TOKEN);
  try {
    logger.info('Started refreshing application (/) commands.');
    const body = Array.from(commands.values()).map(command => command.data.toJSON());
    await rest.put(Routes.applicationCommands(client.user.id), { body });
    logger.info('Successfully reloaded application (/) commands.');
  } catch (error) {
    logger.error('Failed to reload application (/) commands:', error);
  }
}

export default {
  name: 'ready',
  once: true,
  async execute(client: Client) {
    logger.info(`Ready! Logged in as ${client.user?.tag}`);

    client.user?.setPresence({
      activities: [{ name: 'SourceBOT', type: ActivityType.Watching }],
      status: 'online',
    });

    await logToChannel(client, `Logged in as ${client.user?.tag}`);
    await registerCommands(client);
    setupContinuousCheck(client);

    try {
      const initialData = await fetchDataFromAPI();
      if (initialData) {
        postUpdatesToChannel(client, initialData);
      }
    } catch (error) {
      logger.error('Error fetching initial data:', error);
    }
  }
};
