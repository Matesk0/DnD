import { SpellDetails, RaceDetails, ClassDetails } from './dnd-api';

export const EXPANDED_SPELLS: Record<string, SpellDetails> = {
  'fireball': {
    index: 'fireball',
    name: 'Fireball',
    level: 3,
    school: { name: 'Evocation' },
    casting_time: '1 action',
    range: '150 feet',
    components: ['V', 'S', 'M'],
    material: 'A tiny ball of bat guano and sulfur',
    ritual: false,
    duration: 'Instantaneous',
    concentration: false,
    desc: [
      'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.',
      'Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.',
      'The fire spreads around corners. It ignites flammable objects in the area that aren\'t being worn or carried.'
    ],
    higher_level: ['When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.'],
    classes: [{ name: 'Sorcerer' }, { name: 'Wizard' }, { name: 'Light Domain Cleric' }]
  },
  'shield': {
    index: 'shield',
    name: 'Shield',
    level: 1,
    school: { name: 'Abjuration' },
    casting_time: '1 reaction, which you take when you are hit by an attack or targeted by the magic missile spell',
    range: 'Self',
    components: ['V', 'S'],
    ritual: false,
    duration: '1 round',
    concentration: false,
    desc: [
      'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.'
    ],
    classes: [{ name: 'Sorcerer' }, { name: 'Wizard' }]
  },
  'magic-missile': {
    index: 'magic-missile',
    name: 'Magic Missile',
    level: 1,
    school: { name: 'Evocation' },
    casting_time: '1 action',
    range: '120 feet',
    components: ['V', 'S'],
    ritual: false,
    duration: 'Instantaneous',
    concentration: false,
    desc: [
      'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several.'
    ],
    higher_level: ['When you cast this spell using a spell slot of 2nd level or higher, the spell creates one additional dart for each slot level above 1st.'],
    classes: [{ name: 'Sorcerer' }, { name: 'Wizard' }]
  },
  'cure-wounds': {
    index: 'cure-wounds',
    name: 'Cure Wounds',
    level: 1,
    school: { name: 'Evocation' },
    casting_time: '1 action',
    range: 'Touch',
    components: ['V', 'S'],
    ritual: false,
    duration: 'Instantaneous',
    concentration: false,
    desc: [
      'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.'
    ],
    higher_level: ['When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d8 for each slot level above 1st.'],
    classes: [{ name: 'Bard' }, { name: 'Cleric' }, { name: 'Druid' }, { name: 'Paladin' }, { name: 'Ranger' }]
  },
  'haste': {
    index: 'haste',
    name: 'Haste',
    level: 3,
    school: { name: 'Transmutation' },
    casting_time: '1 action',
    range: '30 feet',
    components: ['V', 'S', 'M'],
    material: 'A shaving of licorice root',
    ritual: false,
    duration: 'Concentration, up to 1 minute',
    concentration: true,
    desc: [
      'Choose a willing creature that you can see within range. Until the spell ends, the target\'s speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity saving throws, and it gains an additional action on each of its turns.',
      'That action can be used only to take the Attack (one weapon attack only), Dash, Disengage, Hide, or Use an Object action.',
      'When the spell ends, the target can\'t move or take actions until after its next turn, as a wave of lethargy sweeps over it.'
    ],
    classes: [{ name: 'Sorcerer' }, { name: 'Wizard' }]
  },
  'counterspell': {
    index: 'counterspell',
    name: 'Counterspell',
    level: 3,
    school: { name: 'Abjuration' },
    casting_time: '1 reaction, which you take when you see a creature within 60 feet of you casting a spell',
    range: '60 feet',
    components: ['S'],
    ritual: false,
    duration: 'Instantaneous',
    concentration: false,
    desc: [
      'You attempt to interrupt a creature in the process of casting a spell. If the creature is casting a spell of 3rd level or lower, its spell fails and has no effect. If it is casting a spell of 4th level or higher, make an ability check using your spellcasting ability. The DC equals 10 + the spell\'s level. On a success, the creature\'s spell fails and has no effect.'
    ],
    classes: [{ name: 'Sorcerer' }, { name: 'Warlock' }, { name: 'Wizard' }]
  },
  'eldritch-blast': {
    index: 'eldritch-blast',
    name: 'Eldritch Blast',
    level: 0,
    school: { name: 'Evocation' },
    casting_time: '1 action',
    range: '120 feet',
    components: ['V', 'S'],
    ritual: false,
    duration: 'Instantaneous',
    concentration: false,
    desc: [
      'A beam of crackling energy streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 force damage.',
      'The spell creates more than one beam when you reach higher levels: two beams at 5th level, three beams at 11th level, and four beams at 17th level. You can direct the beams at the same target or at different ones. Make a separate attack roll for each beam.'
    ],
    classes: [{ name: 'Warlock' }]
  },
  'misty-step': {
    index: 'misty-step',
    name: 'Misty Step',
    level: 2,
    school: { name: 'Conjuration' },
    casting_time: '1 bonus action',
    range: 'Self',
    components: ['V'],
    ritual: false,
    duration: 'Instantaneous',
    concentration: false,
    desc: [
      'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.'
    ],
    classes: [{ name: 'Sorcerer' }, { name: 'Wizard' }, { name: 'Warlock' }]
  },
  'thunderwave': {
    index: 'thunderwave',
    name: 'Thunderwave',
    level: 1,
    school: { name: 'Evocation' },
    casting_time: '1 action',
    range: 'Self (15-foot cube)',
    components: ['V', 'S'],
    ritual: false,
    duration: 'Instantaneous',
    concentration: false,
    desc: [
      'A wave of thunderous force sweeps outward from you. Each creature in a 15-foot cube originating from you must make a Constitution saving throw. On a failed save, a creature takes 2d8 thunder damage and is pushed 10 feet away from you. On a successful save, the creature takes half as much damage and isn\'t pushed.',
      'In addition, unsecured objects that are completely within the area of effect are automatically pushed 10 feet away from you by the spell\'s effect, and the spell emits a thunderous boom audible out to 300 feet.'
    ],
    higher_level: ['When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st.'],
    classes: [{ name: 'Bard' }, { name: 'Druid' }, { name: 'Sorcerer' }, { name: 'Wizard' }]
  },
  'revivify': {
    index: 'revivify',
    name: 'Revivify',
    level: 3,
    school: { name: 'Necromancy' },
    casting_time: '1 action',
    range: 'Touch',
    components: ['V', 'S', 'M'],
    material: 'Diamonds worth 300 gp, which the spell consumes',
    ritual: false,
    duration: 'Instantaneous',
    concentration: false,
    desc: [
      'You touch a creature that has died within the last minute. That creature returns to life with 1 hit point. This spell can\'t return to life a creature that has died of old age, nor can it restore any missing body parts.'
    ],
    classes: [{ name: 'Cleric' }, { name: 'Paladin' }]
  }
};

export const EXPANDED_RACES: Record<string, RaceDetails> = {
  'elf': {
    index: 'elf',
    name: 'Elf',
    speed: 30,
    ability_bonuses: [{ ability_score: { name: 'DEX' }, bonus: 2 }],
    alignment: 'Elves love freedom, variety, and self-expression, leaning toward gentle aspects of chaos.',
    age: 'Although elves reach physical maturity at about the same age as humans, the elven understanding of adulthood goes beyond physical growth. An elf typically claims adulthood and an adult name around the age of 100 and can live to be 750 years old.',
    size: 'Medium',
    language_desc: 'You can speak, read, and write Common and Elvish.',
    languages: [{ name: 'Common' }, { name: 'Elvish' }],
    traits: [{ name: 'Darkvision' }, { name: 'Keen Senses' }, { name: 'Fey Ancestry' }, { name: 'Trance' }]
  },
  'dwarf': {
    index: 'dwarf',
    name: 'Dwarf',
    speed: 25,
    ability_bonuses: [{ ability_score: { name: 'CON' }, bonus: 2 }],
    alignment: 'Most dwarves are lawful, believing firmly in the benefits of a well-ordered society. They tend toward good as well, with a strong sense of fair play.',
    age: 'Dwarves mature at the same rate as humans, but they\'re considered young until they reach the age of 50. On average, they live about 350 years.',
    size: 'Medium',
    language_desc: 'You can speak, read, and write Common and Dwarvish.',
    languages: [{ name: 'Common' }, { name: 'Drawvish' }],
    traits: [{ name: 'Darkvision' }, { name: 'Dwarven Resilience' }, { name: 'Dwarven Combat Training' }, { name: 'Stonecunning' }]
  },
  'human': {
    index: 'human',
    name: 'Human',
    speed: 30,
    ability_bonuses: [
      { ability_score: { name: 'STR' }, bonus: 1 },
      { ability_score: { name: 'DEX' }, bonus: 1 },
      { ability_score: { name: 'CON' }, bonus: 1 },
      { ability_score: { name: 'INT' }, bonus: 1 },
      { ability_score: { name: 'WIS' }, bonus: 1 },
      { ability_score: { name: 'CHA' }, bonus: 1 }
    ],
    alignment: 'Humans tend toward no particular alignment. The best and the worst are found among them.',
    age: 'Humans reach adulthood in their late teens and live less than a century.',
    size: 'Medium',
    language_desc: 'You can speak, read, and write Common and one extra language of your choice.',
    languages: [{ name: 'Common' }],
    traits: [{ name: 'Versatility' }]
  },
  'dragonborn': {
    index: 'dragonborn',
    name: 'Dragonborn',
    speed: 30,
    ability_bonuses: [
      { ability_score: { name: 'STR' }, bonus: 2 },
      { ability_score: { name: 'CHA' }, bonus: 1 }
    ],
    alignment: 'Dragonborn tend to extremes, choosing good or evil. Most are good, but those who side with evil are terrible.',
    age: 'Dragonborn mature quickly: walking hours after hatching, reaching the size of a 10-year-old by age 3, adulthood by 15, and living to about 80.',
    size: 'Medium',
    language_desc: 'You can speak, read, and write Common and Draconic.',
    languages: [{ name: 'Common' }, { name: 'Draconic' }],
    traits: [{ name: 'Draconic Ancestry' }, { name: 'Breath Weapon' }, { name: 'Damage Resistance' }]
  },
  'halfling': {
    index: 'halfling',
    name: 'Halfling',
    speed: 25,
    ability_bonuses: [{ ability_score: { name: 'DEX' }, bonus: 2 }],
    alignment: 'Most halflings are lawful good. As a rule, they are good-hearted and kind, hate to see others in pain, and have no tolerance for oppression.',
    age: 'A halfling reaches adulthood at the age of 20 and generally lives into the middle of their second century.',
    size: 'Small',
    language_desc: 'You can speak, read, and write Common and Halfling.',
    languages: [{ name: 'Common' }, { name: 'Halfling' }],
    traits: [{ name: 'Lucky' }, { name: 'Brave' }, { name: 'Halfling Nimbleness' }]
  },
  'tiefling': {
    index: 'tiefling',
    name: 'Tiefling',
    speed: 30,
    ability_bonuses: [
      { ability_score: { name: 'CHA' }, bonus: 2 },
      { ability_score: { name: 'INT' }, bonus: 1 }
    ],
    alignment: 'Tieflings might not have an innate tendency toward evil, but many end up there. Evil or not, an independent nature inclines many tieflings toward a chaotic alignment.',
    age: 'Tieflings mature at the same rate as humans but live a few years longer.',
    size: 'Medium',
    language_desc: 'You can speak, read, and write Common and Infernal.',
    languages: [{ name: 'Common' }, { name: 'Infernal' }],
    traits: [{ name: 'Darkvision' }, { name: 'Hellish Resistance' }, { name: 'Infernal Legacy' }]
  },
  'half-orc': {
    index: 'half-orc',
    name: 'Half-Orc',
    speed: 30,
    ability_bonuses: [
      { ability_score: { name: 'STR' }, bonus: 2 },
      { ability_score: { name: 'CON' }, bonus: 1 }
    ],
    alignment: 'Half-orcs inherit a tendency toward chaos from their orc parents and are not weakly inclined toward good. Those raised among orcs are usually evil.',
    age: 'Half-orcs mature a little faster than humans, reaching adulthood around age 14. They age noticeably faster and rarely live longer than 75 years.',
    size: 'Medium',
    language_desc: 'You can speak, read, and write Common and Orc.',
    languages: [{ name: 'Common' }, { name: 'Orc' }],
    traits: [{ name: 'Darkvision' }, { name: 'Menacing' }, { name: 'Relentless Endurance' }, { name: 'Savage Attacks' }]
  }
};

export const EXPANDED_CLASSES: Record<string, ClassDetails> = {
  'fighter': {
    index: 'fighter',
    name: 'Fighter',
    hit_die: 10,
    saving_throws: [{ name: 'STR' }, { name: 'CON' }],
    proficiencies: [{ name: 'All Armor' }, { name: 'Shields' }, { name: 'Simple Weapons' }, { name: 'Martial Weapons' }],
    proficiency_choices: [
      {
        choose: 2,
        type: 'skills',
        from: {
          options: [
            { item: { name: 'Acrobatics' } },
            { item: { name: 'Animal Handling' } },
            { item: { name: 'Athletics' } },
            { item: { name: 'History' } },
            { item: { name: 'Insight' } },
            { item: { name: 'Intimidation' } },
            { item: { name: 'Perception' } },
            { item: { name: 'Survival' } }
          ]
        }
      }
    ],
    subclasses: [{ name: 'Champion' }, { name: 'Battle Master' }, { name: 'Eldritch Knight' }]
  },
  'wizard': {
    index: 'wizard',
    name: 'Wizard',
    hit_die: 6,
    saving_throws: [{ name: 'INT' }, { name: 'WIS' }],
    proficiencies: [{ name: 'Daggers' }, { name: 'Darts' }, { name: 'Slings' }, { name: 'Quarterstaffs' }, { name: 'Light Crossbows' }],
    proficiency_choices: [
      {
        choose: 2,
        type: 'skills',
        from: {
          options: [
            { item: { name: 'Arcana' } },
            { item: { name: 'History' } },
            { item: { name: 'Insight' } },
            { item: { name: 'Investigation' } },
            { item: { name: 'Medicine' } },
            { item: { name: 'Religion' } }
          ]
        }
      }
    ],
    subclasses: [{ name: 'School of Evocation' }, { name: 'School of Abjuration' }, { name: 'School of Divination' }]
  },
  'rogue': {
    index: 'rogue',
    name: 'Rogue',
    hit_die: 8,
    saving_throws: [{ name: 'DEX' }, { name: 'INT' }],
    proficiencies: [{ name: 'Light Armor' }, { name: 'Simple Weapons' }, { name: 'Hand Crossbows' }, { name: 'Longswords' }, { name: 'Rapiers' }, { name: 'Shortswords' }, { name: 'Thieves\' Tools' }],
    proficiency_choices: [
      {
        choose: 4,
        type: 'skills',
        from: {
          options: [
            { item: { name: 'Acrobatics' } },
            { item: { name: 'Athletics' } },
            { item: { name: 'Deception' } },
            { item: { name: 'Insight' } },
            { item: { name: 'Intimidation' } },
            { item: { name: 'Investigation' } },
            { item: { name: 'Perception' } },
            { item: { name: 'Performance' } },
            { item: { name: 'Persuasion' } },
            { item: { name: 'Sleight of Hand' } },
            { item: { name: 'Stealth' } }
          ]
        }
      }
    ],
    subclasses: [{ name: 'Thief' }, { name: 'Assassin' }, { name: 'Arcane Trickster' }]
  },
  'cleric': {
    index: 'cleric',
    name: 'Cleric',
    hit_die: 8,
    saving_throws: [{ name: 'WIS' }, { name: 'CHA' }],
    proficiencies: [{ name: 'Light Armor' }, { name: 'Medium Armor' }, { name: 'Shields' }, { name: 'Simple Weapons' }],
    proficiency_choices: [
      {
        choose: 2,
        type: 'skills',
        from: {
          options: [
            { item: { name: 'History' } },
            { item: { name: 'Insight' } },
            { item: { name: 'Medicine' } },
            { item: { name: 'Persuasion' } },
            { item: { name: 'Religion' } }
          ]
        }
      }
    ],
    subclasses: [{ name: 'Life Domain' }, { name: 'Tempest Domain' }, { name: 'Light Domain' }]
  },
  'barbarian': {
    index: 'barbarian',
    name: 'Barbarian',
    hit_die: 12,
    saving_throws: [{ name: 'STR' }, { name: 'CON' }],
    proficiencies: [{ name: 'Light Armor' }, { name: 'Medium Armor' }, { name: 'Shields' }, { name: 'Simple Weapons' }, { name: 'Martial Weapons' }],
    proficiency_choices: [
      {
        choose: 2,
        type: 'skills',
        from: {
          options: [
            { item: { name: 'Animal Handling' } },
            { item: { name: 'Athletics' } },
            { item: { name: 'Intimidation' } },
            { item: { name: 'Nature' } },
            { item: { name: 'Perception' } },
            { item: { name: 'Survival' } }
          ]
        }
      }
    ],
    subclasses: [{ name: 'Path of the Berserker' }, { name: 'Path of the Totem Warrior' }]
  },
  'bard': {
    index: 'bard',
    name: 'Bard',
    hit_die: 8,
    saving_throws: [{ name: 'DEX' }, { name: 'CHA' }],
    proficiencies: [{ name: 'Light Armor' }, { name: 'Simple Weapons' }, { name: 'Hand Crossbows' }, { name: 'Longswords' }, { name: 'Rapiers' }, { name: 'Shortswords' }, { name: 'Three Musical Instruments' }],
    proficiency_choices: [
      {
        choose: 3,
        type: 'skills',
        from: {
          options: [
            { item: { name: 'Acrobatics' } }, { item: { name: 'Animal Handling' } }, { item: { name: 'Arcana' } }, { item: { name: 'Athletics' } },
            { item: { name: 'Deception' } }, { item: { name: 'History' } }, { item: { name: 'Insight' } }, { item: { name: 'Intimidation' } },
            { item: { name: 'Investigation' } }, { item: { name: 'Medicine' } }, { item: { name: 'Nature' } }, { item: { name: 'Perception' } },
            { item: { name: 'Performance' } }, { item: { name: 'Persuasion' } }, { item: { name: 'Religion' } }, { item: { name: 'Sleight of Hand' } },
            { item: { name: 'Stealth' } }, { item: { name: 'Survival' } }
          ]
        }
      }
    ],
    subclasses: [{ name: 'College of Lore' }, { name: 'College of Valor' }]
  },
  'paladin': {
    index: 'paladin',
    name: 'Paladin',
    hit_die: 10,
    saving_throws: [{ name: 'WIS' }, { name: 'CHA' }],
    proficiencies: [{ name: 'All Armor' }, { name: 'Shields' }, { name: 'Simple Weapons' }, { name: 'Martial Weapons' }],
    proficiency_choices: [
      {
        choose: 2,
        type: 'skills',
        from: {
          options: [
            { item: { name: 'Athletics' } },
            { item: { name: 'Insight' } },
            { item: { name: 'Intimidation' } },
            { item: { name: 'Medicine' } },
            { item: { name: 'Persuasion' } },
            { item: { name: 'Religion' } }
          ]
        }
      }
    ],
    subclasses: [{ name: 'Oath of Devotion' }, { name: 'Oath of the Ancients' }, { name: 'Oath of Vengeance' }]
  },
  'monk': {
    index: 'monk',
    name: 'Monk',
    hit_die: 8,
    saving_throws: [{ name: 'STR' }, { name: 'DEX' }],
    proficiencies: [{ name: 'Simple Weapons' }, { name: 'Shortswords' }, { name: 'One Artisan tool or Musical Instrument' }],
    proficiency_choices: [
      {
        choose: 2,
        type: 'skills',
        from: {
          options: [
            { item: { name: 'Acrobatics' } },
            { item: { name: 'Athletics' } },
            { item: { name: 'History' } },
            { item: { name: 'Insight' } },
            { item: { name: 'Religion' } },
            { item: { name: 'Stealth' } }
          ]
        }
      }
    ],
    subclasses: [{ name: 'Way of the Open Hand' }, { name: 'Way of Shadow' }, { name: 'Way of the Four Elements' }]
  }
};

export const EXPANDED_BACKGROUNDS: Record<string, any> = {
  'acolyte': {
    index: 'acolyte',
    name: 'Acolyte',
    desc: [
      'You have spent your life in the service of a temple to a specific deity or pantheon of gods.',
      'Feature: Shelter of the Faithful. You and your adventuring companions can expect to receive free healing and care at a temple or shrine of your faith.'
    ],
    starting_proficiencies: [{ name: 'Insight' }, { name: 'Religion' }]
  },
  'criminal': {
    index: 'criminal',
    name: 'Criminal',
    desc: [
      'You are an experienced criminal with a history of breaking the law.',
      'Feature: Criminal Contact. You have a reliable contact who acts as your liaison to a network of other criminals.'
    ],
    starting_proficiencies: [{ name: 'Deception' }, { name: 'Stealth' }]
  },
  'soldier': {
    index: 'soldier',
    name: 'Soldier',
    desc: [
      'War has been your life for as long as you can remember. You trained as a youth, studied weapons and armor.',
      'Feature: Military Rank. Soldiers loyal to your former military organization still recognize your authority.'
    ],
    starting_proficiencies: [{ name: 'Athletics' }, { name: 'Intimidation' }]
  },
  'sage': {
    index: 'sage',
    name: 'Sage',
    desc: [
      'You spent years learning the lore of the multiverse. You scoured manuscripts, studied scrolls, and listened to the greatest experts.',
      'Feature: Researcher. When you attempt to learn or recall a piece of lore, if you do not know that information, you often know where and from whom you can obtain it.'
    ],
    starting_proficiencies: [{ name: 'Arcana' }, { name: 'History' }]
  },
  'folk-hero': {
    index: 'folk-hero',
    name: 'Folk Hero',
    desc: [
      'You come from a humble social rank, but you are destined for so much more. The people of your home village already regard you as their champion.',
      'Feature: Rustic Hospitality. Since you come from the ranks of the common folk, you fit in among them with ease. You can find a place to hide, rest, or recuperate among other commoners.'
    ],
    starting_proficiencies: [{ name: 'Animal Handling' }, { name: 'Survival' }]
  },
  'charlatan': {
    index: 'charlatan',
    name: 'Charlatan',
    desc: [
      'You have a way with people. You know what makes them tick, you can tease out their hearts\' desires, and after a few minutes of conversation, you can figure out how to gain their trust.',
      'Feature: False Identity. You have created a second persona, complete with documentation, established acquaintances, and disguises, that allows you to vanish into another life.'
    ],
    starting_proficiencies: [{ name: 'Deception' }, { name: 'Sleight of Hand' }]
  }
};

export const EXPANDED_FEATS: Record<string, any> = {
  'lucky': {
    index: 'lucky',
    name: 'Lucky',
    desc: [
      'You have inexplicable luck that seems to kick in at just the right moment.',
      'You have 3 luck points. Whenever you make an attack roll, an ability check, or a saving throw, you can spend one luck point to roll an additional d20.',
      'You can also spend one luck point when an attack roll is made against you. Roll a d20, and choose whether the attack uses the attacker\'s roll or yours.'
    ],
    prerequisites: []
  },
  'great-weapon-master': {
    index: 'great-weapon-master',
    name: 'Great Weapon Master',
    desc: [
      'You\'ve learned to put the weight of your weapon to your advantage, letting its momentum empower your strikes.',
      '• On your turn, when you score a critical hit with a melee weapon or reduce a creature to 0 hit points with one, you can make one melee weapon attack as a bonus action.',
      '• Before you make a melee attack with a heavy weapon that you are proficient with, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the damage.'
    ],
    prerequisites: [{ desc: 'Proficiency with at least one martial heavy weapon' }]
  },
  'sharpshooter': {
    index: 'sharpshooter',
    name: 'Sharpshooter',
    desc: [
      'You have mastered ranged weapons and can make shots that others deem impossible.',
      '• Attacking at long range doesn\'t impose disadvantage on your ranged weapon attack rolls.',
      '• Your ranged weapon attacks ignore half cover and three-quarters cover.',
      '• Before you make an attack with a ranged weapon that you are proficient with, you can choose to take a -5 penalty to the attack roll to add +10 to damage.'
    ],
    prerequisites: []
  },
  'alert': {
    index: 'alert',
    name: 'Alert',
    desc: [
      'Always on the lookout for danger, you gain the following benefits:',
      '• You gain a +5 bonus to initiative.',
      '• You can\'t be surprised while you are conscious.',
      '• Other creatures don\'t gain advantage on attack rolls against you as a result of being unseen by you.'
    ],
    prerequisites: []
  },
  'war-caster': {
    index: 'war-caster',
    name: 'War Caster',
    desc: [
      'You have practiced casting spells in the midst of combat, learning techniques that grant you the following benefits:',
      '• You have advantage on Constitution saving throws that you make to maintain your concentration on a spell when you take damage.',
      '• You can perform the somatic components of spells even when you have weapons or a shield in one or both hands.',
      '• When a hostile creature\'s movement provokes an opportunity attack from you, you can use your reaction to cast a spell at the creature, rather than making an opportunity attack.'
    ],
    prerequisites: [{ desc: 'The ability to cast at least one spell' }]
  },
  'mobile': {
    index: 'mobile',
    name: 'Mobile',
    desc: [
      'You are exceptionally speedy and agile, gaining the following benefits:',
      '• Your speed increases by 10 feet.',
      '• When you use the Dash action, difficult terrain doesn\'t cost you extra movement on that turn.',
      '• When you make a melee attack against a creature, you don\'t provoke opportunity attacks from that creature for the rest of the turn, whether you hit or not.'
    ],
    prerequisites: []
  }
};

export const EXPANDED_EQUIPMENT: Record<string, any> = {
  'longsword': {
    index: 'longsword',
    name: 'Longsword',
    desc: 'A martial melee weapon. Versatile property allows it to be wielded with one or two hands, increasing damage from 1d8 to 1d10.',
    cost: { quantity: 15, unit: 'gp' },
    weight: 3
  },
  'leather-armor': {
    index: 'leather-armor',
    name: 'Leather Armor',
    desc: 'Light armor made of tanned hides. AC is 11 + Dexterity modifier. Provides basic protection without hindering stealth.',
    cost: { quantity: 10, unit: 'gp' },
    weight: 10
  },
  'shield': {
    index: 'shield',
    name: 'Shield',
    desc: 'A standard steel or wooden shield. Wielding a shield increases your Armor Class (AC) by +2.',
    cost: { quantity: 10, unit: 'gp' },
    weight: 6
  },
  'greatsword': {
    index: 'greatsword',
    name: 'Greatsword',
    desc: 'A martial melee weapon. Deals 2d6 slashing damage. Has the heavy and two-handed properties.',
    cost: { quantity: 50, unit: 'gp' },
    weight: 6
  },
  'chain-mail': {
    index: 'chain-mail',
    name: 'Chain Mail',
    desc: 'Heavy armor offering 16 AC. Requires Strength 13. Imposes disadvantage on Dexterity (Stealth) checks.',
    cost: { quantity: 75, unit: 'gp' },
    weight: 55
  },
  'shortbow': {
    index: 'shortbow',
    name: 'Shortbow',
    desc: 'A simple ranged weapon. Deals 1d6 piercing damage. Ammunition properties, range 80/320 feet, two-handed.',
    cost: { quantity: 25, unit: 'gp' },
    weight: 2
  }
};

export const EXPANDED_MAGIC_ITEMS: Record<string, any> = {
  'potion-of-healing': {
    index: 'potion-of-healing',
    name: 'Potion of Healing',
    desc: 'A character who drinks the magical red fluid in this vial regains 2d4 + 2 hit points. Drinking or administering a potion takes an action.',
    rarity: { name: 'Common' }
  },
  'ring-of-protection': {
    index: 'ring-of-protection',
    name: 'Ring of Protection',
    desc: 'Requires Attunement. You gain a +1 bonus to Armor Class (AC) and saving throws while wearing this ring.',
    rarity: { name: 'Rare' }
  },
  'bag-of-holding': {
    index: 'bag-of-holding',
    name: 'Bag of Holding',
    desc: 'This bag has an interior space considerably larger than its outside dimensions. The bag can hold up to 500 pounds, not exceeding a volume of 64 cubic feet.',
    rarity: { name: 'Uncommon' }
  },
  'cloak-of-protection': {
    index: 'cloak-of-protection',
    name: 'Cloak of Protection',
    desc: 'Requires Attunement. You gain a +1 bonus to Armor Class (AC) and saving throws while wearing this cloak.',
    rarity: { name: 'Uncommon' }
  },
  'boots-of-elvenkind': {
    index: 'boots-of-elvenkind',
    name: 'Boots of Elvenkind',
    desc: 'Requires Attunement. While wearing these boots, your steps make no sound, regardless of the surface. You have advantage on Dexterity (Stealth) checks that rely on moving silently.',
    rarity: { name: 'Uncommon' }
  },
  'flame-tongue': {
    index: 'flame-tongue',
    name: 'Flame Tongue',
    desc: 'Requires Attunement. You can use a bonus action to speak this magic sword\'s command word, causing flames to shed bright light in a 40-foot radius. Deals an extra 2d6 fire damage on a hit.',
    rarity: { name: 'Rare' }
  }
};
