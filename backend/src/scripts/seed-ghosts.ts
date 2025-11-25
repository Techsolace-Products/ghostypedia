import { query } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

const sampleGhosts = [
  {
    name: 'Poltergeist',
    type: 'spirit',
    origin: 'German folklore',
    culturalContext: 'European',
    description: 'A type of ghost or spirit that is responsible for physical disturbances, such as loud noises and objects being moved or destroyed. The name comes from German words meaning "noisy ghost".',
    characteristics: ['noisy', 'mischievous', 'object manipulation', 'invisible'],
    dangerLevel: 3,
    tags: ['german', 'spirit', 'haunting', 'poltergeist'],
  },
  {
    name: 'Banshee',
    type: 'spirit',
    origin: 'Irish mythology',
    culturalContext: 'Celtic',
    description: 'A female spirit in Irish mythology who heralds the death of a family member, usually by wailing, shrieking, or keening. Her appearance is often that of an old woman in white.',
    characteristics: ['wailing', 'omen of death', 'female', 'prophetic'],
    dangerLevel: 2,
    tags: ['irish', 'celtic', 'death omen', 'banshee'],
  },
  {
    name: 'Yurei',
    type: 'spirit',
    origin: 'Japanese folklore',
    culturalContext: 'Japanese',
    description: 'Ghosts in Japanese folklore, typically depicted as spirits who have died with strong emotions or unfinished business. They often appear in white burial kimono with long black hair.',
    characteristics: ['vengeful', 'tragic', 'unfinished business', 'white clothing'],
    dangerLevel: 4,
    tags: ['japanese', 'yokai', 'spirit', 'vengeful'],
  },
  {
    name: 'La Llorona',
    type: 'spirit',
    origin: 'Mexican folklore',
    culturalContext: 'Latin American',
    description: 'The Weeping Woman, a ghost of a woman who drowned her children and now wanders waterways, crying and searching for them. She is said to kidnap children who wander alone at night.',
    characteristics: ['weeping', 'tragic', 'dangerous to children', 'near water'],
    dangerLevel: 5,
    tags: ['mexican', 'latin american', 'weeping woman', 'tragic'],
  },
  {
    name: 'Headless Horseman',
    type: 'spirit',
    origin: 'American folklore',
    culturalContext: 'American',
    description: 'A headless ghost riding a horse, most famously from "The Legend of Sleepy Hollow". Said to be the ghost of a soldier who lost his head to a cannonball during battle.',
    characteristics: ['headless', 'horseback', 'throws head', 'nocturnal'],
    dangerLevel: 3,
    tags: ['american', 'headless', 'horseman', 'sleepy hollow'],
  },
  {
    name: 'Dullahan',
    type: 'spirit',
    origin: 'Irish mythology',
    culturalContext: 'Celtic',
    description: 'A headless rider from Irish mythology who carries their own head. They are death omens who appear before someone dies, calling out their name.',
    characteristics: ['headless', 'death omen', 'horseback', 'carries own head'],
    dangerLevel: 4,
    tags: ['irish', 'celtic', 'headless', 'death omen'],
  },
  {
    name: 'Pontianak',
    type: 'spirit',
    origin: 'Malay folklore',
    culturalContext: 'Southeast Asian',
    description: 'A vampiric ghost of a woman who died during childbirth. She appears as a beautiful woman but transforms into a terrifying creature to attack victims.',
    characteristics: ['vampiric', 'beautiful', 'transforms', 'attacks men'],
    dangerLevel: 5,
    tags: ['malay', 'vampire', 'spirit', 'dangerous'],
  },
  {
    name: 'Draugr',
    type: 'undead',
    origin: 'Norse mythology',
    culturalContext: 'Scandinavian',
    description: 'Undead creatures from Norse mythology that guard their burial mounds. They possess superhuman strength and can increase their size at will.',
    characteristics: ['undead', 'strong', 'guards treasure', 'size-changing'],
    dangerLevel: 4,
    tags: ['norse', 'viking', 'undead', 'guardian'],
  },
  {
    name: 'Kitsune',
    type: 'yokai',
    origin: 'Japanese folklore',
    culturalContext: 'Japanese',
    description: 'Fox spirits with magical abilities, including shapeshifting into human form. They can be benevolent or malicious, growing more powerful with age.',
    characteristics: ['shapeshifter', 'fox', 'magical', 'intelligent'],
    dangerLevel: 2,
    tags: ['japanese', 'yokai', 'fox', 'shapeshifter'],
  },
  {
    name: 'Bloody Mary',
    type: 'spirit',
    origin: 'Urban legend',
    culturalContext: 'Western',
    description: 'A ghost that appears in mirrors when summoned by chanting her name. Origins vary, but she is typically depicted as a vengeful spirit who attacks those who summon her.',
    characteristics: ['mirror', 'summoned', 'vengeful', 'urban legend'],
    dangerLevel: 3,
    tags: ['urban legend', 'mirror', 'vengeful', 'modern'],
  },
];

async function seedGhosts() {
  console.log('Starting ghost entity seeding...');

  try {
    for (const ghost of sampleGhosts) {
      await query(
        `INSERT INTO ghost_entities (name, type, origin, cultural_context, description, characteristics, danger_level, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (name) DO NOTHING`,
        [
          ghost.name,
          ghost.type,
          ghost.origin,
          ghost.culturalContext,
          ghost.description,
          ghost.characteristics,
          ghost.dangerLevel,
          ghost.tags,
        ]
      );
      console.log(`✓ Added: ${ghost.name}`);
    }

    console.log(`\n✅ Successfully seeded ${sampleGhosts.length} ghost entities!`);
  } catch (error) {
    console.error('❌ Error seeding ghosts:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedGhosts();
