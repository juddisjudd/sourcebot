import type {
  Interaction,
  ChatInputCommandInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
} from 'discord.js';
import commands from '../handlers/commandHandler';
import logger from '../utils/logger';

export const onInteraction = async (interaction: Interaction) => {
  if (interaction.isChatInputCommand()) {
    await handleCommandInteraction(interaction as ChatInputCommandInteraction);
  } else if (interaction.isButton()) {
    await handleButtonInteraction(interaction as ButtonInteraction);
  } else if (interaction.isStringSelectMenu()) {
    await handleSelectMenuInteraction(interaction as StringSelectMenuInteraction);
  }
};

async function handleCommandInteraction(interaction: ChatInputCommandInteraction) {
  const command = commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply({ content: 'Command not found.', ephemeral: true });
    return;
  }

  try {
    if (command.run) await command.run(interaction);
  } catch (error) {
    logger.error(`Error executing command ${interaction.commandName} for ${interaction.user.tag}:`, error);
    await interaction.reply({
      content: 'An error occurred while executing the command. Please try again later.',
      ephemeral: true,
    });
  }
}

async function handleButtonInteraction(interaction: ButtonInteraction) {
  logger.info(`Button ${interaction.customId} pressed`);
  interaction.update({ content: 'Button pressed!', components: [] });
}

async function handleSelectMenuInteraction(interaction: StringSelectMenuInteraction) {
  logger.info(`Menu item selected: ${interaction.values.join(', ')}`);
  await interaction.update({
    content: `You selected: ${interaction.values.join(', ')}`,
    components: [],
  });
}
