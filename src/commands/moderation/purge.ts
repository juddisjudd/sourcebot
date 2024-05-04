import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
  PermissionsBitField
} from 'discord.js';
import type { Command } from '../../interfaces/command';
import logger from '../../utils/logger';

const Purge: Command = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Deletes messages in the current channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand(subcommand =>
      subcommand
        .setName('any')
        .setDescription('Delete any X amount of messages')
        .addIntegerOption(option =>
          option.setName('count').setDescription('Number of messages to delete').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('user')
        .setDescription('Delete X amount of messages from a specific user')
        .addUserOption(option => option.setName('user').setDescription('The user').setRequired(true))
        .addIntegerOption(option =>
          option.setName('count').setDescription('Number of messages to delete').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('after')
        .setDescription('Delete messages after a specific message ID')
        .addStringOption(option =>
          option.setName('messageid').setDescription('The ID of the message to start deleting after').setRequired(true))
        .addIntegerOption(option =>
          option.setName('count').setDescription('Number of messages to delete').setRequired(false))),

  async run(interaction: ChatInputCommandInteraction) {
    if (!(interaction.channel instanceof TextChannel)) {
      await interaction.reply({ content: 'This command can only be used in text channels.', ephemeral: true });
      return;
    }

    const subcommand = interaction.options.getSubcommand(true);

    try {
      if (subcommand === 'any') {
        const count = interaction.options.getInteger('count', true);
        const messages = await interaction.channel.messages.fetch({ limit: Math.min(100, count) });
        const deletedMessages = await interaction.channel.bulkDelete(messages, true);
        await interaction.reply({ content: `Successfully deleted ${deletedMessages.size} messages.`, ephemeral: true });
      } else if (subcommand === 'user') {
        const user = interaction.options.getUser('user', true);
        const count = interaction.options.getInteger('count', true);
        const allMessages = await interaction.channel.messages.fetch({ limit: 100 });
        const userMessages = allMessages.filter(msg => msg.author.id === user.id).first(count);
        const deletedMessages = await interaction.channel.bulkDelete(userMessages, true);
        await interaction.reply({
          content: `Successfully deleted ${deletedMessages.size} messages from ${user.tag}.`,
          ephemeral: true,
        });
      } else if (subcommand === 'after') {
        const messageId = interaction.options.getString('messageid', true);
        const count = interaction.options.getInteger('count', false) || 100;  // Default to a higher number if not specified
        const messages = await interaction.channel.messages.fetch({ after: messageId, limit: Math.min(100, count) });
        const messagesToKeep = messages.size > count ? messages.lastKey(count) : messages.firstKey();
        const messagesToDelete = messages.filter((_, key) => key !== messagesToKeep);
        await interaction.channel.bulkDelete(messagesToDelete, true);
        await interaction.reply({
          content: `Successfully deleted messages after the specified message.`,
          ephemeral: true,
        });
      }
    } catch (error) {
      logger.error('Failed to delete messages:', error);
      await interaction.reply({ content: 'An error occurred while deleting messages.', ephemeral: true });
    }
  },
};

export default Purge;
