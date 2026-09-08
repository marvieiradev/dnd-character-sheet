import { type AbilityKey, type Attack, type Character, type ClassFeature, type Spell } from "../types/dndTypes";
import { defaultStarterCharacters } from "./defaultStarterCharacters";

export const STORAGE = "ironbound-ledger.characters.v1";
export const abilityLabels: AbilityKey[] = ["FOR", "DES", "CON", "INT", "SAB", "CAR"];
export const starterCharacters: Character[] = [
  ...defaultStarterCharacters.map(character => ({
    ...character,
    spellAbility: character.spellAbility as AbilityKey,
  }))
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
        type: "contundente",
      },
      {
        id: "blast",
        name: "Explosão Mística",
        bonus: 7,
        damage: "1d10",
        type: "força",
      },
    ];
export const classTraductions = {
  artificer: "Artífice",
  bard: "Bardo",
  cleric: "Clérigo",
  druid: "Druida",
  fighter: "Guerreiro",
  monk: "Monge",
  paladin: "Paladino",
  ranger: "Patrulheiro",
  rogue: "Ladino",
  sorcerer: "Feiticeiro",
  warlock: "Bruxo",
  wizard: "Mago",
}
export const classCatalog: Record<
  string,
  { spells: string[]; features: string[]; slots: number[]; abilities: Record<AbilityKey, number> }
> = {
  artificer: {
    spells: ["Curar ferimentos", "Fogo das fadas", "Absorver elementos"],
    features: ["Sintonia com itens mágicos", "Infundir item", "Ferramentas de artesão"],
    slots: [0, 2, 0, 0, 0, 0, 0, 0, 0],
    abilities: { FOR: 10, DES: 14, CON: 14, INT: 18, SAB: 10, CAR: 10 },
  },
  bard: {
    spells: ["Zombaria viciosa", "Palavra curativa", "Sussurros dissonantes"],
    features: ["Inspiração de bardo", "Profissional versátil"],
    slots: [0, 2, 0, 0, 0, 0, 0, 0, 0],
    abilities: { FOR: 10, DES: 14, CON: 12, INT: 12, SAB: 10, CAR: 18 },
  },
  cleric: {
    spells: ["Bênção", "Curar ferimentos", "Raio guiador"],
    features: ["Canalizar divindade", "Domínio divino"],
    slots: [0, 2, 0, 0, 0, 0, 0, 0, 0],
    abilities: { FOR: 14, DES: 8, CON: 14, INT: 10, SAB: 18, CAR: 10 },
  },
  druid: {
    spells: ["Bons frutos", "Enredar", "Onda trovejante"],
    features: ["Forma selvagem", "Conjuração druídica"],
    slots: [0, 2, 0, 0, 0, 0, 0, 0, 0],
    abilities: { FOR: 10, DES: 14, CON: 13, INT: 12, SAB: 16, CAR: 18 },
  },
  fighter: {
    spells: [],
    features: ["Segundo fôlego", "Surto de ação"],
    slots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    abilities: { FOR: 18, DES: 12, CON: 16, INT: 8, SAB: 10, CAR: 8 },
  },
  monk: {
    spells: [],
    features: ["Defesa sem armadura", "Artes marciais", "Ki"],
    slots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    abilities: { FOR: 12, DES: 18, CON: 14, INT: 10, SAB: 16, CAR: 8 },
  },
  paladin: {
    spells: ["Bênção", "Favor divino"],
    features: ["Sentido divino", "Imposição das mãos"],
    slots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    abilities: { FOR: 18, DES: 10, CON: 16, INT: 8, SAB: 12, CAR: 16 },
  },
  ranger: {
    spells: ["Marca do caçador", "Curar ferimentos"],
    features: ["Inimigo predileto", "Explorador natural"],
    slots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    abilities: { FOR: 12, DES: 18, CON: 14, INT: 10, SAB: 16, CAR: 8 },
  },
  rogue: {
    spells: [],
    features: ["Ataque furtivo", "Ação ardilosa"],
    slots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    abilities: { FOR: 10, DES: 18, CON: 14, INT: 10, SAB: 12, CAR: 10 },
  },
  sorcerer: {
    spells: ["Mãos flamejantes", "Mísseis mágicos", "Escudo"],
    features: ["Fonte de magia", "Metamagia"],
    slots: [0, 2, 0, 0, 0, 0, 0, 0, 0],
    abilities: { FOR: 8, DES: 12, CON: 12, INT: 18, SAB: 16, CAR: 10 },
  },
  warlock: {
    spells: ["Rajada mística", "Feitiço", "Armadura de Agathys"],
    features: ["Invocações místicas", "Patrono sobrenatural"],
    slots: [0, 1, 0, 0, 0, 0, 0, 0, 0],
    abilities: { FOR: 8, DES: 12, CON: 14, INT: 10, SAB: 12, CAR: 18 },
  },
  wizard: {
    spells: ["Mãos flamejantes", "Mísseis mágicos", "Escudo"],
    features: ["Recuperação arcana", "Tradição arcana"],
    slots: [0, 2, 0, 0, 0, 0, 0, 0, 0],
    abilities: { FOR: 8, DES: 12, CON: 14, INT: 10, SAB: 12, CAR: 18 },
  },
};
export const templateFor = (className: string) =>
  classCatalog[className.trim().toLowerCase()] ?? {
    spells: [],
    features: [],
    slots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    abilities: { FOR: 20, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 },
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
  type: "passiva",
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