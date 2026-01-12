/**
 * Rise & Shine Level Constants
 *
 * Level-specific messaging and configuration for Rise & Shine presentations.
 */

import { RiseAndShineLevel } from '@/types/form';

export interface RiseAndShineLevelConfig {
  title: string;
  description: string;
  slides: string;
  mockups: string;
  hours: string;
  eligibility: string;
  eligibilityColor: 'red' | 'blue';
  extraNote?: string;
}

export const RISE_AND_SHINE_LEVELS: Record<RiseAndShineLevel, RiseAndShineLevelConfig> = {
  Bronze: {
    title: 'Rise & Shine Bronze',
    description:
      'A Rise & Shine deck can never have a deadline that is needed. The Bronze Deck is a 5-8 Slide presentation showing 20-40 individual mockups. This deck can be completed in 12 active hours.',
    slides: '5-8',
    mockups: '20-40',
    hours: '12',
    eligibility:
      'All clients with a project value under $50K or PROSPECTS of any size goal',
    eligibilityColor: 'red',
  },
  Silver: {
    title: 'Rise & Shine Silver',
    description:
      'A Rise & Shine deck can never have a deadline that is needed. The Silver Deck is a 15-30 Slide presentation showing roughly 100 individual mockups. This deck can be completed in 30 active hours.',
    slides: '15-30',
    mockups: '~100',
    hours: '30',
    eligibility:
      'To use this level card - the Sales Goal must be between $50K - $250K and be a CLIENT not a PROSPECT',
    eligibilityColor: 'red',
  },
  Gold: {
    title: 'Rise & Shine Gold',
    description:
      'A Rise & Shine deck can never have a deadline that is needed. The Gold Deck is a 50+ Slide presentation showing 200 individual mockups. This deck can be completed in 60 active hours.',
    slides: '50+',
    mockups: '200',
    hours: '60',
    eligibility:
      'To use this level card - the Sales Goal must be at least $250K and be a CLIENT not a PROSPECT',
    eligibilityColor: 'red',
    extraNote:
      "Gold decks are very structured. Each department within the client's business should be explored. Sales is encouraged to provide research. Deadline for a Gold Deck should be at minimum 1 month from today.",
  },
};

export const ASANA_BOARD_URL = 'https://app.asana.com/0/1212723974363121/board';
export const FOLLOW_TEMPLATE_URL = 'https://docs.google.com/presentation/d/1example/edit'; // TODO: Get actual template URL
