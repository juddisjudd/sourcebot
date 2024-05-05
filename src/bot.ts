import { Client, GatewayIntentBits } from 'discord.js';
import config from './config';
import { registerEventHandlers } from './handlers/eventsHandler';
import logger from './utils/logger';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
  ],
});

registerEventHandlers(client);

client.on('debug', (m) => logger.debug(m));
client.on('warn', (m) => logger.warn(m));
client.on('error', (m) => logger.error(m));

// Use the DISCORD_TOKEN from the config object
client.login(config.DISCORD_TOKEN).catch((error) => {
  logger.error('Failed to login:', error);
});
