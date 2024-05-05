// Import logger from the utilities
import logger from './utils/logger';

// Define an interface for the environment variables
interface Env {
  DISCORD_TOKEN: string;
  BOT_OWNER_ID: string;
  LOG_CHANNEL_ID: string;
  MEMBER_ACTIVITY_CHANNEL: string;
  MEMBER_ROLE_ID: string;
}

// A class to handle configuration operations
class Config {
  public readonly DISCORD_TOKEN: string;
  public readonly BOT_OWNER_ID: string;
  public readonly LOG_CHANNEL_ID: string;
  public readonly MEMBER_ACTIVITY_CHANNEL: string;
  public readonly MEMBER_ROLE_ID: string;

  constructor() {
    this.DISCORD_TOKEN = process.env.DISCORD_TOKEN || '';
    this.BOT_OWNER_ID = process.env.BOT_OWNER_ID || '';
    this.LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || '';
    this.MEMBER_ACTIVITY_CHANNEL = process.env.MEMBER_ACTIVITY_CHANNEL || '';
    this.MEMBER_ROLE_ID = process.env.MEMBER_ROLE_ID || '';

    this.validateEnv();
  }

  private validateEnv(): void {
    if (!this.DISCORD_TOKEN || !this.BOT_OWNER_ID || !this.LOG_CHANNEL_ID || !this.MEMBER_ACTIVITY_CHANNEL || !this.MEMBER_ROLE_ID) {
      logger.error('Missing required environment variables');
      throw new Error('Missing required environment variables');
    }
  }
}

// Create and export a single instance of Config
const config = new Config();
export default config;
