import logger from './utils/logger';

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
export const BOT_OWNER_ID = process.env.BOT_OWNER_ID;
export const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

if (!DISCORD_TOKEN || !BOT_OWNER_ID || !LOG_CHANNEL_ID) {
  throw logger.error('Missing required environment variables');
}

interface Env {
  DISCORD_TOKEN: string;
  BOT_OWNER_ID: string;
  LOG_CHANNEL_ID: string;
}

const Config: Env = {
  DISCORD_TOKEN,
  BOT_OWNER_ID,
  LOG_CHANNEL_ID,
};

export default Config;
