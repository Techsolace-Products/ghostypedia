-- Sample Ghost Entities for Ghostypedia

INSERT INTO ghost_entities (name, type, origin, cultural_context, description, characteristics, danger_level, tags)
VALUES 
  ('Poltergeist', 'spirit', 'German folklore', 'European', 
   'A type of ghost or spirit that is responsible for physical disturbances, such as loud noises and objects being moved or destroyed. The name comes from German words meaning "noisy ghost".',
   ARRAY['noisy', 'mischievous', 'object manipulation', 'invisible'], 3,
   ARRAY['german', 'spirit', 'haunting', 'poltergeist']),
   
  ('Banshee', 'spirit', 'Irish mythology', 'Celtic',
   'A female spirit in Irish mythology who heralds the death of a family member, usually by wailing, shrieking, or keening. Her appearance is often that of an old woman in white.',
   ARRAY['wailing', 'omen of death', 'female', 'prophetic'], 2,
   ARRAY['irish', 'celtic', 'death omen', 'banshee']),
   
  ('Yurei', 'spirit', 'Japanese folklore', 'Japanese',
   'Ghosts in Japanese folklore, typically depicted as spirits who have died with strong emotions or unfinished business. They often appear in white burial kimono with long black hair.',
   ARRAY['vengeful', 'tragic', 'unfinished business', 'white clothing'], 4,
   ARRAY['japanese', 'yokai', 'spirit', 'vengeful']),
   
  ('La Llorona', 'spirit', 'Mexican folklore', 'Latin American',
   'The Weeping Woman, a ghost of a woman who drowned her children and now wanders waterways, crying and searching for them. She is said to kidnap children who wander alone at night.',
   ARRAY['weeping', 'tragic', 'dangerous to children', 'near water'], 5,
   ARRAY['mexican', 'latin american', 'weeping woman', 'tragic']),
   
  ('Headless Horseman', 'spirit', 'American folklore', 'American',
   'A headless ghost riding a horse, most famously from "The Legend of Sleepy Hollow". Said to be the ghost of a soldier who lost his head to a cannonball during battle.',
   ARRAY['headless', 'horseback', 'throws head', 'nocturnal'], 3,
   ARRAY['american', 'headless', 'horseman', 'sleepy hollow']),
   
  ('Dullahan', 'spirit', 'Irish mythology', 'Celtic',
   'A headless rider from Irish mythology who carries their own head. They are death omens who appear before someone dies, calling out their name.',
   ARRAY['headless', 'death omen', 'horseback', 'carries own head'], 4,
   ARRAY['irish', 'celtic', 'headless', 'death omen']),
   
  ('Pontianak', 'spirit', 'Malay folklore', 'Southeast Asian',
   'A vampiric ghost of a woman who died during childbirth. She appears as a beautiful woman but transforms into a terrifying creature to attack victims.',
   ARRAY['vampiric', 'beautiful', 'transforms', 'attacks men'], 5,
   ARRAY['malay', 'vampire', 'spirit', 'dangerous']),
   
  ('Draugr', 'undead', 'Norse mythology', 'Scandinavian',
   'Undead creatures from Norse mythology that guard their burial mounds. They possess superhuman strength and can increase their size at will.',
   ARRAY['undead', 'strong', 'guards treasure', 'size-changing'], 4,
   ARRAY['norse', 'viking', 'undead', 'guardian']),
   
  ('Kitsune', 'yokai', 'Japanese folklore', 'Japanese',
   'Fox spirits with magical abilities, including shapeshifting into human form. They can be benevolent or malicious, growing more powerful with age.',
   ARRAY['shapeshifter', 'fox', 'magical', 'intelligent'], 2,
   ARRAY['japanese', 'yokai', 'fox', 'shapeshifter']),
   
  ('Bloody Mary', 'spirit', 'Urban legend', 'Western',
   'A ghost that appears in mirrors when summoned by chanting her name. Origins vary, but she is typically depicted as a vengeful spirit who attacks those who summon her.',
   ARRAY['mirror', 'summoned', 'vengeful', 'urban legend'], 3,
   ARRAY['urban legend', 'mirror', 'vengeful', 'modern'])
ON CONFLICT (name) DO NOTHING;
