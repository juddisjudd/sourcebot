import { Client, GatewayIntentBits, Events, AuditLogEvent } from 'discord.js';
import { DISCORD_TOKEN } from './config';
import { onReady } from './events/onReady';
import { onInteraction } from './events/onInteraction';

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

onReady(client);

client.on(Events.InteractionCreate, onInteraction);

client.on('debug', (m) => logger.debug(m));
client.on('warn', (m) => logger.warn(m));
client.on('error', (m) => logger.error(m));

client.login(DISCORD_TOKEN).catch((error) => {
  logger.error('Failed to login:', error);
});
