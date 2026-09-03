export type AbilityKey = "FOR" | "DES" | "CON" | "INT" | "SAB" | "CAR";
export type Tab = "combat" | "spells" | "inventory" | "resources";
export type Spell = {
  id: string;
  name: string;
  level: number;
  prepared: boolean;
  description: string;
  uses: number;
  used: number;
  recoverShort?: boolean;
  recoverLong?: boolean;
};
export type Attack = {
  id: string;
  name: string;
  bonus: number;
  damage: string;
  type: string;
};
export type ClassFeature = {
  id: string;
  name: string;
  description: string;
  type?: string;
  uses: number;
  used: number;
  recoverShort?: boolean;
  recoverLong?: boolean;
};

export type Character = {
  id: string;
  name: string;
  race: string;
  className: string;
  level: number;
  hp: number;
  maxHp: number;
  tempHp: number;
  ac: number;
  speed: number;
  initiative: number;
  abilities: Record<AbilityKey, number>;
  proficiency: number;
  spellAbility: AbilityKey;
  spellSlots: number[];
  spentSlots: number[];
  gold: number;
  silver: number;
  copper: number;
  avatar?: string;
  spells: string[];
  spellbook?: Spell[];
  attacks?: Attack[];
  classFeatures?: ClassFeature[];
  equipment: { name: string; qty: number }[];
};