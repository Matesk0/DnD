export interface DndListItem {
  index: string;
  name: string;
  url?: string;
  level?: number; // for spells
}

export interface SpellDetails {
  index: string;
  name: string;
  desc: string[];
  higher_level?: string[];
  range: string;
  components: string[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number;
  school: { name: string };
  classes: { name: string }[];
}

export interface MonsterDetails {
  index: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  armor_class: { type: string; value: number }[];
  hit_points: number;
  hit_dice: string;
  speed: Record<string, string>;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  challenge_rating: number;
  xp: number;
  actions?: { name: string; desc: string }[];
  special_abilities?: { name: string; desc: string }[];
}

export interface ClassDetails {
  index: string;
  name: string;
  hit_die: number;
  proficiency_choices: { choose: number; type: string; from: { options: { item: { name: string } }[] } }[];
  proficiencies: { name: string }[];
  saving_throws: { name: string }[];
  subclasses?: { name: string }[];
}

export interface RaceDetails {
  index: string;
  name: string;
  speed: number;
  ability_bonuses: { ability_score: { name: string }; bonus: number }[];
  alignment: string;
  age: string;
  size: string;
  language_desc: string;
  languages: { name: string }[];
  traits: { name: string }[];
}
