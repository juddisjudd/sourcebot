import type { Interaction, ChatInputCommandInteraction, PermissionsBitField, PermissionResolvable } from 'discord.js';
import commands from '../handlers/commandHandler';
import logger from '../utils/logger';

export const onInteraction = async (interaction: Interaction) => {
  if (interaction.isChatInputCommand()) {
    const commandInteraction = interaction as ChatInputCommandInteraction;

    const command = commands.get(commandInteraction.commandName);
    if (!command) {
      await commandInteraction.reply({ content: 'Command not found.', ephemeral: true });
      return;
    }

    if (command.permissions) {
      const memberPermissions = commandInteraction.member?.permissions as PermissionsBitField;
      if (!memberPermissions.has(command.permissions as PermissionResolvable)) {
        await commandInteraction.reply({
          content: 'You do not have the required permissions to use this command.',
          ephemeral: true,
        });
        return;
      }
    }

    if (typeof command.run === 'function') {
      try {
        await command.run(commandInteraction);
      } catch (error) {
        handleCommandError(commandInteraction, error);
      }
    }
  } else {
    // Handle other types of interactions
  }
};

async function handleCommandError(interaction: ChatInputCommandInteraction, error: any) {
  logger.error(`Error executing command ${interaction.commandName}:`, error);
  await interaction.reply({
    content: 'There was an error executing that command. Please try again later.',
    ephemeral: true,
  });
}
