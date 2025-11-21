// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import { executeInTransaction, closeDatabaseConnection } from '../config/database';
import { PoolClient } from 'pg';

// Sample ghost entities with varied attributes
const ghostEntities = [
  {
    name: 'Banshee',
    type: 'Spirit',
    origin: 'Ireland',
    cultural_context: 'Irish folklore',
    description: 'A female spirit in Irish mythology who heralds the death of a family member by wailing. The banshee is often depicted as a woman with long flowing hair, wearing a grey cloak over a green dress.',
    characteristics: ['wailing', 'prophetic', 'female spirit', 'death omen'],
    danger_level: 3,
    image_url: 'https://example.com/banshee.jpg',
    tags: ['irish', 'spirit', 'death', 'folklore']
  },
  {
    name: 'Yurei',
    type: 'Ghost',
    origin: 'Japan',
    cultural_context: 'Japanese folklore',
    description: 'Spirits of the dead in Japanese folklore, often depicted with long black hair, white burial kimono, and lacking feet. They are souls who died with strong emotions or unfinished business.',
    characteristics: ['vengeful', 'tragic', 'white kimono', 'long hair'],
    danger_level: 4,
    image_url: 'https://example.com/yurei.jpg',
    tags: ['japanese', 'ghost', 'vengeful', 'tragic']
  },
  {
    name: 'Poltergeist',
    type: 'Entity',
    origin: 'Germany',
    cultural_context: 'Germanic folklore',
    description: 'A type of ghost or spirit responsible for physical disturbances such as loud noises and objects being moved or destroyed. The name comes from German words meaning "noisy ghost".',
    characteristics: ['noisy', 'mischievous', 'object manipulation', 'invisible'],
    danger_level: 2,
    image_url: 'https://example.com/poltergeist.jpg',
    tags: ['german', 'entity', 'mischievous', 'noisy']
  },
  {
    name: 'La Llorona',
    type: 'Spirit',
    origin: 'Mexico',
    cultural_context: 'Mexican folklore',
    description: 'The Weeping Woman of Mexican legend who drowned her children and now wanders near bodies of water, crying and searching for them. Her wail is said to be a death omen.',
    characteristics: ['weeping', 'tragic', 'water-associated', 'child-seeking'],
    danger_level: 4,
    image_url: 'https://example.com/llorona.jpg',
    tags: ['mexican', 'spirit', 'tragic', 'water']
  },
  {
    name: 'Dullahan',
    type: 'Fairy',
    origin: 'Ireland',
    cultural_context: 'Irish mythology',
    description: 'A headless rider from Irish folklore who carries their own head under one arm. They ride a black horse and use a human spine as a whip. Seeing a Dullahan is an omen of death.',
    characteristics: ['headless', 'horseback rider', 'death omen', 'unstoppable'],
    danger_level: 5,
    image_url: 'https://example.com/dullahan.jpg',
    tags: ['irish', 'fairy', 'death', 'headless']
  },
  {
    name: 'Pontianak',
    type: 'Vampire',
    origin: 'Malaysia',
    cultural_context: 'Malay folklore',
    description: 'A vampiric ghost in Malay mythology, the spirit of a woman who died during childbirth. She appears as a beautiful woman but has a hole in her back and preys on men.',
    characteristics: ['vampiric', 'beautiful', 'dangerous', 'childbirth-related'],
    danger_level: 5,
    image_url: 'https://example.com/pontianak.jpg',
    tags: ['malaysian', 'vampire', 'dangerous', 'female']
  },
  {
    name: 'Will-o\'-the-Wisp',
    type: 'Phenomenon',
    origin: 'England',
    cultural_context: 'European folklore',
    description: 'Mysterious lights seen over marshes and bogs, believed to be spirits of the dead or fairies. They lure travelers off safe paths into dangerous terrain.',
    characteristics: ['luminous', 'deceptive', 'marsh-dwelling', 'misleading'],
    danger_level: 2,
    image_url: 'https://example.com/wisp.jpg',
    tags: ['english', 'phenomenon', 'light', 'deceptive']
  },
  {
    name: 'Jiangshi',
    type: 'Undead',
    origin: 'China',
    cultural_context: 'Chinese folklore',
    description: 'Chinese hopping vampire or zombie, a reanimated corpse that moves by hopping and drains life force from victims. They are stiff-limbed and often depicted in Qing dynasty official dress.',
    characteristics: ['hopping', 'stiff', 'life-draining', 'undead'],
    danger_level: 4,
    image_url: 'https://example.com/jiangshi.jpg',
    tags: ['chinese', 'undead', 'vampire', 'hopping']
  },
  {
    name: 'Draugr',
    type: 'Undead',
    origin: 'Scandinavia',
    cultural_context: 'Norse mythology',
    description: 'Undead creatures from Norse mythology that guard their burial mounds and treasures. They possess superhuman strength and can increase their size at will.',
    characteristics: ['strong', 'guardian', 'shape-shifting', 'treasure-hoarding'],
    danger_level: 5,
    image_url: 'https://example.com/draugr.jpg',
    tags: ['norse', 'undead', 'guardian', 'strong']
  },
  {
    name: 'Kitsune',
    type: 'Spirit',
    origin: 'Japan',
    cultural_context: 'Japanese folklore',
    description: 'Fox spirits in Japanese folklore with the ability to shape-shift into human form. They can be benevolent or malicious, and their power increases with age, growing additional tails.',
    characteristics: ['shape-shifting', 'fox', 'intelligent', 'magical'],
    danger_level: 3,
    image_url: 'https://example.com/kitsune.jpg',
    tags: ['japanese', 'spirit', 'fox', 'shape-shifter']
  }
];

// Sample stories linked to ghost entities
const stories = [
  {
    title: 'The Banshee\'s Warning',
    content: 'In the misty hills of County Cork, the O\'Brien family had lived for generations. One autumn evening, as the sun set behind the ancient oak trees, a piercing wail echoed through the valley. Old Margaret O\'Brien knew immediately what it meant - the banshee had come. The family gathered, and within three days, the eldest son passed peacefully in his sleep, just as the banshee had foretold.',
    origin: 'Ireland',
    cultural_context: 'Traditional Irish folklore tale',
    estimated_reading_time: 5,
    tags: ['banshee', 'ireland', 'death', 'family'],
    ghost_entity_names: ['Banshee']
  },
  {
    title: 'The Yurei of Oiwa',
    content: 'Oiwa was a beautiful woman betrayed by her husband, who poisoned her to marry another. Her face became disfigured, and she died in agony. But death was not the end. Her yurei returned, haunting her husband with visions of her ruined face until he went mad with guilt and took his own life. To this day, actors performing her story must visit her shrine to avoid her curse.',
    origin: 'Japan',
    cultural_context: 'Based on the famous Yotsuya Kaidan tale',
    estimated_reading_time: 7,
    tags: ['yurei', 'japan', 'revenge', 'tragedy'],
    ghost_entity_names: ['Yurei']
  },
  {
    title: 'The Poltergeist of Enfield',
    content: 'In 1977, a family in Enfield, London, experienced one of the most documented poltergeist cases in history. Furniture moved on its own, objects flew across rooms, and strange knocking sounds echoed through the house. The activity centered around two young sisters, and investigators documented hundreds of incidents over eighteen months before the disturbances finally ceased.',
    origin: 'England',
    cultural_context: 'Based on real documented events',
    estimated_reading_time: 8,
    tags: ['poltergeist', 'england', 'documented', 'modern'],
    ghost_entity_names: ['Poltergeist']
  },
  {
    title: 'La Llorona\'s Lament',
    content: 'Maria was once the most beautiful woman in her village, married to a wealthy man. But when he left her for another, her grief turned to madness. In a moment of rage and despair, she drowned her two children in the river. Immediately realizing what she had done, she drowned herself as well. Now her spirit wanders the waterways, crying "Ay, mis hijos!" - "Oh, my children!" - forever searching for the souls she destroyed.',
    origin: 'Mexico',
    cultural_context: 'Traditional Mexican legend',
    estimated_reading_time: 6,
    tags: ['la-llorona', 'mexico', 'tragedy', 'water'],
    ghost_entity_names: ['La Llorona']
  },
  {
    title: 'The Headless Horseman of Ireland',
    content: 'Unlike his American counterpart, the Irish Dullahan is far more terrifying. He rides through the night on a black steed, carrying his severed head that glows with an eerie light. When he stops riding, someone dies. No gate can bar his way, no lock can keep him out. The only protection is gold - the Dullahan fears this metal above all else.',
    origin: 'Ireland',
    cultural_context: 'Irish mythology and folklore',
    estimated_reading_time: 5,
    tags: ['dullahan', 'ireland', 'death', 'headless'],
    ghost_entity_names: ['Dullahan']
  },
  {
    title: 'The Pontianak\'s Revenge',
    content: 'In a village in Malaysia, a young woman died in childbirth, her baby lost as well. The villagers buried her according to tradition, but they forgot one crucial step - they did not place glass beads in her mouth or needles in her hands. That night, she rose as a pontianak. Beautiful and terrible, she hunted those who had wronged her in life, her vengeance swift and merciless.',
    origin: 'Malaysia',
    cultural_context: 'Malay folklore and tradition',
    estimated_reading_time: 6,
    tags: ['pontianak', 'malaysia', 'vampire', 'revenge'],
    ghost_entity_names: ['Pontianak']
  },
  {
    title: 'Lost in the Marsh',
    content: 'Thomas was traveling home late one foggy night when he saw a light dancing in the distance. Thinking it was a lantern from a nearby farm, he followed it, hoping to ask for directions. But the light led him deeper into the marsh, always just out of reach. By the time he realized his mistake, he was hopelessly lost. They found him the next morning, half-frozen and babbling about fairy lights.',
    origin: 'England',
    cultural_context: 'English folklore warning tale',
    estimated_reading_time: 4,
    tags: ['will-o-wisp', 'england', 'deception', 'marsh'],
    ghost_entity_names: ['Will-o\'-the-Wisp']
  },
  {
    title: 'The Hopping Dead of Qing Dynasty',
    content: 'During the Qing Dynasty, a Taoist priest was hired to transport corpses back to their ancestral homes for proper burial. To make them easier to move, he would reanimate them as jiangshi, making them hop along behind him in a line. But one night, he lost control of his charges, and the hopping corpses scattered into the countryside, terrorizing villages until they were finally laid to rest.',
    origin: 'China',
    cultural_context: 'Chinese folklore and tradition',
    estimated_reading_time: 7,
    tags: ['jiangshi', 'china', 'undead', 'qing-dynasty'],
    ghost_entity_names: ['Jiangshi']
  },
  {
    title: 'The Draugr\'s Hoard',
    content: 'Thorvald the Viking was buried with his treasure in a great mound, but his greed was so strong that death could not hold him. He rose as a draugr, guarding his gold with supernatural strength. Many warriors tried to claim his treasure, but none succeeded. The draugr would grow to enormous size, crushing any who dared enter his barrow. Finally, a clever hero tricked him into the sunlight, where he crumbled to dust.',
    origin: 'Scandinavia',
    cultural_context: 'Norse saga tradition',
    estimated_reading_time: 8,
    tags: ['draugr', 'norse', 'treasure', 'warrior'],
    ghost_entity_names: ['Draugr']
  },
  {
    title: 'The Nine-Tailed Fox',
    content: 'In ancient Japan, a kitsune lived in the forest for a thousand years, growing nine magnificent tails. She could take any form she wished and possessed great magical power. Sometimes she would help lost travelers, other times she would play tricks on the arrogant. A young monk once befriended her, and she taught him the secrets of the forest. When he died of old age, she mourned him for a hundred years before returning to her tricks.',
    origin: 'Japan',
    cultural_context: 'Japanese folklore and mythology',
    estimated_reading_time: 6,
    tags: ['kitsune', 'japan', 'fox', 'magic'],
    ghost_entity_names: ['Kitsune']
  },
  {
    title: 'Spirits of the Emerald Isle',
    content: 'Ireland is a land rich with supernatural beings. The banshee wails for the dying, the dullahan rides as death\'s messenger, and countless other spirits walk the misty hills. This collection explores the connections between these entities, how they interact with each other and with the mortal world, and why Ireland remains one of the most haunted places on Earth.',
    origin: 'Ireland',
    cultural_context: 'Compilation of Irish folklore',
    estimated_reading_time: 10,
    tags: ['ireland', 'compilation', 'spirits', 'folklore'],
    ghost_entity_names: ['Banshee', 'Dullahan']
  },
  {
    title: 'Asian Ghost Stories',
    content: 'From the yurei of Japan to the pontianak of Malaysia, from the jiangshi of China to the kitsune spirits, Asian folklore is filled with diverse and fascinating supernatural entities. Each culture has its own unique perspective on death, the afterlife, and the spirits that bridge both worlds. This anthology explores these rich traditions and the stories that have been passed down through generations.',
    origin: 'Asia',
    cultural_context: 'Pan-Asian folklore compilation',
    estimated_reading_time: 15,
    tags: ['asia', 'compilation', 'diverse', 'anthology'],
    ghost_entity_names: ['Yurei', 'Pontianak', 'Jiangshi', 'Kitsune']
  }
];

// Sample user accounts for testing
const users = [
  {
    email: 'alice@example.com',
    username: 'alice_ghost_hunter',
    password: 'password123',
    preferences: {
      favorite_ghost_types: ['Spirit', 'Ghost'],
      preferred_content_types: ['story', 'ghost_entity'],
      cultural_interests: ['Irish', 'Japanese'],
      spookiness_level: 4,
      email_notifications: true,
      recommendation_alerts: true
    }
  },
  {
    email: 'bob@example.com',
    username: 'bob_paranormal',
    password: 'password123',
    preferences: {
      favorite_ghost_types: ['Undead', 'Vampire'],
      preferred_content_types: ['ghost_entity', 'myth'],
      cultural_interests: ['Chinese', 'Norse'],
      spookiness_level: 5,
      email_notifications: false,
      recommendation_alerts: true
    }
  },
  {
    email: 'carol@example.com',
    username: 'carol_folklore',
    password: 'password123',
    preferences: {
      favorite_ghost_types: ['Fairy', 'Phenomenon'],
      preferred_content_types: ['story', 'movie'],
      cultural_interests: ['English', 'Mexican'],
      spookiness_level: 2,
      email_notifications: true,
      recommendation_alerts: false
    }
  }
];

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  await executeInTransaction(async (client: PoolClient) => {
    // Insert ghost entities and store their IDs
    console.log('Seeding ghost entities...');
    const ghostEntityMap = new Map<string, string>();
    
    for (const ghost of ghostEntities) {
      const result = await client.query(
        `INSERT INTO ghost_entities 
         (name, type, origin, cultural_context, description, characteristics, danger_level, image_url, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          ghost.name,
          ghost.type,
          ghost.origin,
          ghost.cultural_context,
          ghost.description,
          ghost.characteristics,
          ghost.danger_level,
          ghost.image_url,
          ghost.tags
        ]
      );
      ghostEntityMap.set(ghost.name, result.rows[0].id);
    }
    console.log(`✓ Inserted ${ghostEntities.length} ghost entities`);
    
    // Create some ghost entity relationships
    console.log('Creating ghost entity relationships...');
    const relationships = [
      ['Banshee', 'Dullahan'], // Both Irish death omens
      ['Yurei', 'Kitsune'], // Both Japanese spirits
      ['Pontianak', 'Jiangshi'], // Both Asian vampiric entities
      ['Draugr', 'Jiangshi'], // Both undead guardians
    ];
    
    for (const [ghost1, ghost2] of relationships) {
      const id1 = ghostEntityMap.get(ghost1);
      const id2 = ghostEntityMap.get(ghost2);
      if (id1 && id2) {
        await client.query(
          `INSERT INTO ghost_entity_relationships (ghost_entity_id, related_ghost_entity_id)
           VALUES ($1, $2)`,
          [id1, id2]
        );
      }
    }
    console.log(`✓ Created ${relationships.length} ghost entity relationships`);
    
    // Insert stories and link to ghost entities
    console.log('Seeding stories...');
    for (const story of stories) {
      const storyResult = await client.query(
        `INSERT INTO stories 
         (title, content, origin, cultural_context, estimated_reading_time, tags)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          story.title,
          story.content,
          story.origin,
          story.cultural_context,
          story.estimated_reading_time,
          story.tags
        ]
      );
      
      const storyId = storyResult.rows[0].id;
      
      // Link story to ghost entities
      for (const ghostName of story.ghost_entity_names) {
        const ghostId = ghostEntityMap.get(ghostName);
        if (ghostId) {
          await client.query(
            `INSERT INTO story_ghost_entities (story_id, ghost_entity_id)
             VALUES ($1, $2)`,
            [storyId, ghostId]
          );
        }
      }
    }
    console.log(`✓ Inserted ${stories.length} stories with ghost entity links`);
    
    // Insert users with preferences and sample data
    console.log('Seeding users...');
    const userIds: string[] = [];
    
    for (const user of users) {
      // Hash password
      const passwordHash = await bcrypt.hash(user.password, 10);
      
      // Insert user
      const userResult = await client.query(
        `INSERT INTO users (email, username, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [user.email, user.username, passwordHash]
      );
      
      const userId = userResult.rows[0].id;
      userIds.push(userId);
      
      // Insert preferences
      await client.query(
        `INSERT INTO preference_profiles 
         (user_id, favorite_ghost_types, preferred_content_types, cultural_interests, 
          spookiness_level, email_notifications, recommendation_alerts)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          user.preferences.favorite_ghost_types,
          user.preferences.preferred_content_types,
          user.preferences.cultural_interests,
          user.preferences.spookiness_level,
          user.preferences.email_notifications,
          user.preferences.recommendation_alerts
        ]
      );
    }
    console.log(`✓ Inserted ${users.length} users with preferences`);
    
    // Add sample interactions for users
    console.log('Seeding interactions...');
    let interactionCount = 0;
    
    for (const userId of userIds) {
      // Each user views some ghost entities
      const ghostIds = Array.from(ghostEntityMap.values()).slice(0, 5);
      for (const ghostId of ghostIds) {
        await client.query(
          `INSERT INTO interactions (user_id, content_id, content_type, interaction_type)
           VALUES ($1, $2, $3, $4)`,
          [userId, ghostId, 'ghost_entity', 'view']
        );
        interactionCount++;
      }
      
      // Each user reads some stories
      const storyResult = await client.query(
        `SELECT id FROM stories LIMIT 3`
      );
      for (const row of storyResult.rows) {
        await client.query(
          `INSERT INTO interactions (user_id, content_id, content_type, interaction_type)
           VALUES ($1, $2, $3, $4)`,
          [userId, row.id, 'story', 'read']
        );
        interactionCount++;
      }
    }
    console.log(`✓ Inserted ${interactionCount} interactions`);
    
    // Add sample bookmarks
    console.log('Seeding bookmarks...');
    let bookmarkCount = 0;
    
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      
      // Bookmark some ghost entities
      const ghostIds = Array.from(ghostEntityMap.values()).slice(i * 2, i * 2 + 2);
      for (const ghostId of ghostIds) {
        await client.query(
          `INSERT INTO bookmarks (user_id, content_id, content_type, tags, notes)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, ghostId, 'ghost_entity', ['favorite', 'interesting'], 'Really fascinating entity!']
        );
        bookmarkCount++;
      }
    }
    console.log(`✓ Inserted ${bookmarkCount} bookmarks`);
    
    // Add sample reading progress
    console.log('Seeding reading progress...');
    const storyIds = await client.query(`SELECT id FROM stories LIMIT 5`);
    let progressCount = 0;
    
    for (const userId of userIds) {
      for (let i = 0; i < 2; i++) {
        const storyId = storyIds.rows[i].id;
        const progress = (i + 1) * 30; // 30%, 60%
        
        await client.query(
          `INSERT INTO reading_progress 
           (user_id, story_id, progress_percentage, last_read_position, is_completed)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, storyId, progress, progress * 10, progress === 100]
        );
        progressCount++;
      }
    }
    console.log(`✓ Inserted ${progressCount} reading progress records`);
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nSample accounts:');
    users.forEach(user => {
      console.log(`  - ${user.email} / ${user.password}`);
    });
  }, 'seed_database');
}

async function clearDatabase() {
  console.log('Clearing database...');
  
  await executeInTransaction(async (client: PoolClient) => {
    // Delete in reverse order of dependencies
    await client.query('DELETE FROM recommendation_feedback');
    await client.query('DELETE FROM recommendations');
    await client.query('DELETE FROM interactions');
    await client.query('DELETE FROM bookmarks');
    await client.query('DELETE FROM reading_progress');
    await client.query('DELETE FROM conversation_messages');
    await client.query('DELETE FROM sessions');
    await client.query('DELETE FROM story_ghost_entities');
    await client.query('DELETE FROM ghost_entity_relationships');
    await client.query('DELETE FROM stories');
    await client.query('DELETE FROM ghost_entities');
    await client.query('DELETE FROM preference_profiles');
    await client.query('DELETE FROM users');
    
    console.log('✅ Database cleared successfully!');
  }, 'clear_database');
}

async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'seed':
        await seedDatabase();
        break;
      
      case 'clear':
        await clearDatabase();
        break;
      
      case 'reset':
        await clearDatabase();
        await seedDatabase();
        break;
      
      default:
        console.log('Usage: npm run seed [seed|clear|reset]');
        console.log('  seed  - Add sample data to the database');
        console.log('  clear - Remove all data from the database');
        console.log('  reset - Clear and re-seed the database');
        process.exit(1);
    }
    
    await closeDatabaseConnection();
    process.exit(0);
  } catch (error) {
    console.error('Seed operation failed:', error);
    await closeDatabaseConnection();
    process.exit(1);
  }
}

main();
