import { type AbilityKey, type Attack, type Character, type ClassFeature, type Spell } from "../types/dndTypes";

export const STORAGE = "ironbound-ledger.characters.v1";
export const abilityLabels: AbilityKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
export const starterCharacters: Character[] = [
  {
    id: "lyra",
    name: "Lyra Vex",
    race: "Tiefling",
    className: "Warlock",
    level: 5,
    hp: 31,
    maxHp: 38,
    tempHp: 4,
    ac: 14,
    speed: 30,
    initiative: 3,
    abilities: { STR: 8, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 18 },
    proficiency: 3,
    spellAbility: "CHA",
    spellSlots: [0, 4, 3, 2, 0, 0, 0, 0, 0],
    spentSlots: [0, 1, 0, 0, 0, 0, 0, 0, 0],
    gold: 84,
    silver: 12,
    copper: 8,
    avatar: "LV",
    spells: ["Eldritch Blast", "Hex", "Armor of Agathys", "Hunger of Hadar"],
    equipment: [
      { name: "Cajado de freixo", qty: 1 },
      { name: "Kit de aventureiro", qty: 1 },
      { name: "Poção de cura", qty: 2 },
    ],
  },
  {
    id: "bram",
    name: "Bram Stonehand",
    race: "Anão",
    className: "Fighter",
    level: 4,
    hp: 42,
    maxHp: 42,
    tempHp: 0,
    ac: 18,
    speed: 25,
    initiative: 1,
    abilities: { STR: 18, DEX: 12, CON: 16, INT: 9, WIS: 11, CHA: 10 },
    proficiency: 2,
    spellAbility: "WIS",
    spellSlots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    spentSlots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    gold: 36,
    silver: 4,
    copper: 16,
    avatar: "BS",
    spells: [],
    equipment: [
      { name: "Machado de batalha", qty: 1 },
      { name: "Escudo de carvalho", qty: 1 },
    ],
  },
];
export const mod = (score: number) => Math.floor((score - 10) / 2);
export const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
export const hash = (value: string) =>
  Array.from(value)
    .reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
    .toString(16);
export const clone = (v: Character) => JSON.parse(JSON.stringify(v)) as Character;
export const defaultAttacks = (c: Character): Attack[] =>
  c.attacks?.length
    ? c.attacks
    : [
        {
          id: "staff",
          name: "Cajado de freixo",
          bonus: 6,
          damage: "1d6 + 3",
          type: "bludgeoning",
        },
        {
          id: "blast",
          name: "Eldritch Blast",
          bonus: 7,
          damage: "1d10",
          type: "force",
        },
      ];
export const classCatalog: Record<
  string,
  { spells: string[]; features: string[]; slots: number[] }
> = {
  bard: {
    spells: ["Zombaria viciosa", "Palavra curativa", "Sussurros dissonantes"],
    features: ["Inspiração de bardo", "Jack of All Trades"],
    slots: [0, 2, 0, 0, 0, 0, 0, 0, 0],
  },
  cleric: {
    spells: ["Bênção", "Curar ferimentos", "Raio guiador"],
    features: ["Canalizar divindade", "Domínio divino"],
    slots: [0, 2, 0, 0, 0, 0, 0, 0, 0],
  },
  druid: {
    spells: ["Bons frutos", "Enredar", "Onda trovejante"],
    features: ["Forma selvagem", "Conjuração druídica"],
    slots: [0, 2, 0, 0, 0, 0, 0, 0, 0],
  },
  fighter: {
    spells: [],
    features: ["Segundo fôlego", "Surto de ação"],
    slots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  paladin: {
    spells: ["Bênção", "Favor divino"],
    features: ["Sentido divino", "Imposição das mãos"],
    slots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  ranger: {
    spells: ["Marca do caçador", "Curar ferimentos"],
    features: ["Inimigo predileto", "Explorador natural"],
    slots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  rogue: {
    spells: [],
    features: ["Ataque furtivo", "Ação ardilosa"],
    slots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  sorcerer: {
    spells: ["Mãos flamejantes", "Mísseis mágicos", "Escudo"],
    features: ["Fonte de magia", "Metamagia"],
    slots: [0, 2, 0, 0, 0, 0, 0, 0, 0],
  },
  warlock: {
    spells: ["Rajada mística", "Hex", "Armadura de Agathys"],
    features: ["Invocações místicas", "Patrono sobrenatural"],
    slots: [0, 1, 0, 0, 0, 0, 0, 0, 0],
  },
  wizard: {
    spells: ["Mãos flamejantes", "Mísseis mágicos", "Escudo"],
    features: ["Recuperação arcana", "Tradição arcana"],
    slots: [0, 2, 0, 0, 0, 0, 0, 0, 0],
  },
};
export const templateFor = (className: string) =>
  classCatalog[className.trim().toLowerCase()] ?? {
    spells: [],
    features: [],
    slots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
export const spellFromName = (name: string, index: number): Spell => ({
  id: crypto.randomUUID(),
  name,
  level: index + 1,
  prepared: true,
  description: "",
  uses: 0,
  used: 0,
  recoverShort: false,
  recoverLong: true,
});
export const featureFromName = (name: string): ClassFeature => ({
  id: crypto.randomUUID(),
  name,
  description: "",
  type: "passive",
  uses: 0,
  used: 0,
  recoverShort: true,
  recoverLong: true,
});
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "?")
    .join("") || "UA";
export const avatarLabel = (c: Character) =>
  c.avatar?.startsWith("data:image/") ? (
    <img className="avatar-image" src={c.avatar} alt={`Avatar de ${c.name}`} />
  ) : (
    <span>{initials(c.name)}</span>
  );