import { GuildMember, TextChannel } from 'discord.js';
import { MEMBER_ACTIVITY_CHANNEL } from '../config';
import logger from '../utils/logger';

export const onMemberJoin = async (member: GuildMember) => {
  const channel = member.guild.channels.cache.get(MEMBER_ACTIVITY_CHANNEL as string) as TextChannel;
  if (!(channel instanceof TextChannel)) {
    logger.error('The specified channel is not a text channel.');
    return;
  }

  const welcomeMessage = `Welcome <@${member.id}> to the server!`;
  try {
    await channel.send(welcomeMessage);
    logger.info('Welcome message sent.');
  } catch (error) {
    logger.error(`Failed to send welcome message: ${error}`);
  }

  const roleId = '1229322570206023791';
  const role = member.guild.roles.cache.get(roleId);

  if (!role) {
    logger.error(`Role not found: ${roleId}`);
    return;
  }

  try {
    await member.roles.add(role);
    logger.info(`Assigned role '${role.name}' to ${member.displayName}`);
  } catch (error) {
    logger.error(`Could not assign role to ${member.displayName}: ${error}`);
  }
};
