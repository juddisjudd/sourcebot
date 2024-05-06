import { Client, EmbedBuilder, ChannelType, NewsChannel } from 'discord.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

const zonesPath = path.join(__dirname, '../data/games/d2r/zones.json');
const historyPath = path.join(__dirname, '../data/games/d2r/history.json');
const zones = require(zonesPath) as Record<string, any>;
const channelID = '1235719234525593624';

export interface ZoneData {
  current: string[];
  next: string[];
  next_terror_time_utc?: number;
}

export async function fetchTerrorZoneData(client: Client) {
  try {
    const data = await fetchDataFromAPI();
    if (!data) return;

    const lastData: ZoneData = fs.existsSync(historyPath) ? JSON.parse(fs.readFileSync(historyPath, 'utf8')) : {current: [], next: []};

    if (isDataDifferent(data, lastData)) {
      fs.writeFileSync(historyPath, JSON.stringify(data, null, 2));
      postUpdatesToChannel(client, data);
      logger.info('New zone data fetched and posted.');
    }
    setTimeout(() => setupContinuousCheck(client), computeMillisecondsToNextHour());
  } catch (error) {
    logger.error('Error in fetching or posting data:', error);
  }
}

function computeMillisecondsToNextHour() {
  const now = new Date();
  return ((60 - now.getMinutes()) * 60 * 1000) - (now.getSeconds() * 1000) - now.getMilliseconds();
}

export function setupContinuousCheck(client: Client) {
  setTimeout(() => {
    const intervalId = setInterval(() => fetchTerrorZoneData(client), 30000);
    setTimeout(() => clearInterval(intervalId), 5 * 60000);  // Stop after 5 minutes
  }, computeMillisecondsToNextHour());
}

export async function fetchDataFromAPI(): Promise<ZoneData | null> {
  try {
    const response = await axios.get('https://www.d2emu.com/api/v1/tz', {
      headers: {
        'Accept-Encoding': 'gzip, deflate'
      }
    });
    if (response.status === 200 && response.data.current && Array.isArray(response.data.current)) {
      return response.data as ZoneData;
    } else {
      logger.error('Invalid or missing data:', response.data);
      return null;
    }
  } catch (error) {
    logger.error('Error fetching terror zone data:', error);
    return null;
  }
}

function isDataDifferent(newData: ZoneData, oldData: ZoneData): boolean {
  return JSON.stringify(newData) !== JSON.stringify(oldData);
}

function buildEmbeds(data: any): EmbedBuilder[] {
  const embeds = [];

  const createZoneEmbed = (title: string, zoneIds: string[], color: number): EmbedBuilder => {
      const embed = new EmbedBuilder()
          .setTitle(title)
          .setColor(color);

      for (const id of zoneIds) {
          const zone = zones[id];
          if (zone) {
              embed.setImage(zone.image);
              break;
          }
      }

      if (!embed.data.image) {
          embed.setDescription('No valid zones found.');
      }

      return embed;
  };

  const currentColor = 0x00FF00;
  const nextColor = 0xFF0000;

  if (data.current && Array.isArray(data.current)) {
      const currentEmbed = createZoneEmbed('CURRENT ZONE:', data.current, currentColor);
      embeds.push(currentEmbed);
  }

  if (data.next && Array.isArray(data.next)) {
      const nextEmbed = createZoneEmbed('NEXT ZONE:', data.next, nextColor);
      embeds.push(nextEmbed);
  }

  const footerEmbed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setDescription('**BOT CREATED BY**: <@111629316164481024> | [**SHOW SUPPORT**](https://ko-fi.com/ohitsjudd) | **DATA BY:** [D2Emu](https://www.d2emu.com/api/v1/tz)');

  embeds.push(footerEmbed);

  return embeds;
}

export async function postUpdatesToChannel(client: Client, data: ZoneData) {
    const channel = client.channels.cache.get(channelID) as NewsChannel;
    if (!channel) {
      logger.error('The channel does not exist.');
      return;
    }
  
    if (channel.type !== ChannelType.GuildNews) {
      logger.error(`The channel with ID ${channelID} is not a news channel.`);
      return;
    }
  
    const embeds = buildEmbeds(data);
    try {
      const message = await channel.send({ embeds });
      logger.info('Message sent to the news channel successfully.');
      try {
        await message.crosspost();
        logger.info('Message crossposted successfully.');
      } catch (crosspostError) {
        logger.error(`Failed to crosspost message: ${crosspostError}`, crosspostError);
      }
    } catch (sendError) {
      logger.error(`Failed to send message to news channel: ${sendError}`, sendError);
    }
  }
  