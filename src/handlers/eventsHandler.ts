import { Client } from 'discord.js';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

export const registerEventHandlers = (client: Client): void => {
  const eventsPath = path.join(__dirname, '..', 'events');
  try {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

    for (const file of eventFiles) {
      try {
        const event = require(path.join(eventsPath, file)).default;
        if (event.once) {
          client.once(event.name, (...args: any[]) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args: any[]) => event.execute(...args, client));
        }
      } catch (error) {
        logger.error(`Error loading event ${file}: ${error}`);
      }
    }
  } catch (error) {
    logger.error(`Failed to read the events directory at ${eventsPath}: ${error}`);
  }
};
