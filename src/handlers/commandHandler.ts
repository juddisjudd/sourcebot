import type { Command } from '../interfaces/command';
import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger';

const commands = new Map<string, Command>();

async function loadCommands(directory: string): Promise<void> {
  const commandFiles = await fs.readdir(directory);

  for (const file of commandFiles) {
    const fullPath = path.join(directory, file);
    try {
      const fileStats = await fs.stat(fullPath);
      if (fileStats.isDirectory()) {
        await loadCommands(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        if (file === 'index.ts') continue;

        const commandModule = await import(fullPath);
        const command: Command = commandModule.default;
        commands.set(command.data.name, command);

        logger.info(`Loaded command ${command.data.name}`);
      }
    } catch (error) {
      logger.error(`Error loading command in ${fullPath}: ${error}`);
    }
  }
}

(async () => {
  await loadCommands(path.join(__dirname, '../commands'));
})().catch((error) => logger.error(`Failed to load commands: ${error}`));

export default commands;
