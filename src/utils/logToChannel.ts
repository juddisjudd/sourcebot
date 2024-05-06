import { Client, TextChannel } from 'discord.js';
import config from '../config';
import logger from './logger';

export async function logToChannel(client: Client, message: string) {
  try {
    const channel = await client.channels.fetch(config.LOG_CHANNEL_ID!);
    if (channel instanceof TextChannel) {
      channel.send(message);
    }
  } catch (error) {
    logger.error('Failed to send message to channel:', error);
  }
}
