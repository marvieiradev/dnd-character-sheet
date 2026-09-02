/* Ironbound Ledger: página operacional assimétrica; carvão, âmbar de forja, serif display e dados escaneáveis. */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Backpack,
  ChevronRight,
  CircleHelp,
  Coins,
  Download,
  Flame,
  HeartPulse,
  Import,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  Swords,
  Trash2,
  WandSparkles,
  Dices,
  LockKeyhole,
  ScrollText,
  Sparkles,
  X,
} from "lucide-react";

type AbilityKey = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";
type Tab = "combat" | "spells" | "inventory" | "resources";
type Spell = {
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
type Attack = {
  id: string;
  name: string;
  bonus: number;
  damage: string;
  type: string;
};
type ClassFeature = {
  id: string;
  name: string;
  description: string;
  type?: string;
  uses: number;
  used: number;
  recoverShort?: boolean;
  recoverLong?: boolean;
};

type Character = {
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

const STORAGE = "ironbound-ledger.characters.v1";
const abilityLabels: AbilityKey[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const starterCharacters: Character[] = [
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
const mod = (score: number) => Math.floor((score - 10) / 2);
const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
const hash = (value: string) =>
  Array.from(value)
    .reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
    .toString(16);
const clone = (v: Character) => JSON.parse(JSON.stringify(v)) as Character;
const defaultAttacks = (c: Character): Attack[] =>
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
const classCatalog: Record<
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
const templateFor = (className: string) =>
  classCatalog[className.trim().toLowerCase()] ?? {
    spells: [],
    features: [],
    slots: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
const spellFromName = (name: string, index: number): Spell => ({
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
const featureFromName = (name: string): ClassFeature => ({
  id: crypto.randomUUID(),
  name,
  description: "",
  type: "passive",
  uses: 0,
  used: 0,
  recoverShort: true,
  recoverLong: true,
});
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "?")
    .join("") || "UA";
const avatarLabel = (c: Character) =>
  c.avatar?.startsWith("data:image/") ? (
    <img className="avatar-image" src={c.avatar} alt={`Avatar de ${c.name}`} />
  ) : (
    <span>{initials(c.name)}</span>
  );

function IconButton({
  label,
  children,
  onClick,
  danger = false,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`icon-btn ${danger ? "icon-danger" : ""}`}
    >
      {children}
    </button>
  );
}

function CharacterForm({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (c: Character) => void;
}) {
  const [name, setName] = useState("");
  const [race, setRace] = useState("");
  const [className, setClassNome] = useState("");
  const [level, setLevel] = useState(1);
  const [maxHp, setMaxHp] = useState(10);
  const [ac, setAc] = useState(10);
  const [speed, setSpeed] = useState(30);
  const [initiative, setInitiative] = useState(0);
  const [avatar, setAvatar] = useState<string | undefined>();
  const [abilities, setAbilities] = useState<Record<AbilityKey, number>>({
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
  });
  const [slots, setSlots] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [spells, setSpells] = useState<Spell[]>([]);
  const [features, setFeatures] = useState<ClassFeature[]>([]);
  const updateAbility = (a: AbilityKey, value: string) =>
    setAbilities(v => ({
      ...v,
      [a]: Math.max(1, Math.min(30, Number(value) || 0)),
    }));
  const applyTemplate = () => {
    const template = templateFor(className);
    setSlots([...template.slots]);
    setSpells(template.spells.map(spellFromName));
    setFeatures(template.features.map(featureFromName));
    toast.success("Modelo aplicado", {
      description:
        "Magias, habilidades e espaços foram preenchidos. Você pode editar tudo antes de criar.",
    });
  };
  const addSpell = () =>
    setSpells(v => [...v, spellFromName("Nova magia", v.length)]);
  const addFeature = () =>
    setFeatures(v => [...v, featureFromName("Nova habilidade")]);
  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast.error("Selecione uma imagem válida");
    if (file.size > 2 * 1024 * 1024)
      return toast.error("Avatar muito grande", {
        description: "Escolha uma imagem de até 2 MB.",
      });
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !race.trim() || !className.trim())
      return toast.error("Preencha os dados de identidade", {
        description: "Nome, raça e classe são obrigatórios.",
      });
    const c: Character = {
      id: crypto.randomUUID(),
      name: name.trim(),
      race: race.trim(),
      className: className.trim(),
      level,
      hp: maxHp,
      maxHp,
      tempHp: 0,
      ac,
      speed,
      initiative,
      abilities,
      proficiency: level >= 5 ? 3 : 2,
      spellAbility: "WIS",
      spellSlots: slots,
      spentSlots: slots.map(() => 0),
      gold: 0,
      silver: 0,
      copper: 0,
      avatar,
      spells: spells.map(s => s.name),
      spellbook: spells,
      classFeatures: features,
      equipment: [],
    };
    onCreate(c);
  };
  return (
    <div className="modal-backdrop">
      <form className="modal character-form" onSubmit={submit}>
        <button type="button" className="modal-close" onClick={onCancel}>
          <X size={18} />
        </button>
        <div className="modal-icon">
          <Sparkles size={23} />
        </div>
        <div className="eyebrow">NOVO PERSONAGEM · ESPAÇO DISPONÍVEL</div>
        <h2>Abra um novo registro.</h2>
        <p className="form-note">
          Comece com um modelo de classe ou preencha tudo manualmente. Cada
          campo continuará editável na ficha.
        </p>
        <div className="form-section">
          <span className="section-kicker">IDENTIDADE</span>
          <div className="form-grid three">
            <label>
              Nome
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex.: Elara Thorn"
                autoFocus
              />
            </label>
            <label>
              Raça
              <input
                value={race}
                onChange={e => setRace(e.target.value)}
                placeholder="Ex.: Elfa"
              />
            </label>
            <label>
              Classe
              <select
                value={className}
                onChange={e => setClassNome(e.target.value)}
              >
                <option value="">Selecione uma classe</option>
                {Object.keys(classCatalog).map(item => (
                  <option key={item} value={item}>
                    {
                      (
                        {
                          bard: "Bardo",
                          cleric: "Clérigo",
                          druid: "Druida",
                          fighter: "Guerreiro",
                          paladin: "Paladino",
                          ranger: "Patrulheiro",
                          rogue: "Ladino",
                          sorcerer: "Feiticeiro",
                          warlock: "Bruxo",
                          wizard: "Mago",
                        } as Record<string, string>
                      )[item]
                    }
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="template-action">
            <span>
              Preencha magias, habilidades e espaços com um ponto de partida por
              classe.
            </span>
            <button
              type="button"
              className="button secondary"
              onClick={applyTemplate}
            >
              Aplicar modelo da classe
            </button>
          </div>
          <label className="avatar-upload">
            {avatar ? (
              <img
                className="avatar-preview"
                src={avatar}
                alt="Prévia do avatar"
              />
            ) : (
              <span className="avatar-preview initials-preview">
                {initials(name)}
              </span>
            )}
            <span>
              <b>{avatar ? "Trocar avatar" : "Adicionar avatar"}</b>
              <small>PNG, JPG ou WebP · máximo 2 MB</small>
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatar}
              hidden
            />
          </label>
        </div>
        <div className="form-section">
          <span className="section-kicker">ATRIBUTOS E COMBATE</span>
          <div className="form-grid five">
            <label>
              Nível
              <input
                type="number"
                min="1"
                max="20"
                value={level}
                onChange={e => setLevel(Number(e.target.value))}
              />
            </label>
            <label>
              PV máximos
              <input
                type="number"
                min="1"
                value={maxHp}
                onChange={e => setMaxHp(Number(e.target.value))}
              />
            </label>
            <label>
              Classe de armadura
              <input
                type="number"
                min="1"
                value={ac}
                onChange={e => setAc(Number(e.target.value))}
              />
            </label>
            <label>
              Deslocamento
              <input
                type="number"
                min="0"
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
              />
            </label>
            <label>
              Iniciativa
              <input
                type="number"
                value={initiative}
                onChange={e => setInitiative(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="form-grid six">
            {abilityLabels.map(a => (
              <label key={a}>
                {a}
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={abilities[a]}
                  onChange={e => updateAbility(a, e.target.value)}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="form-section">
          <div className="section-head">
            <span className="section-kicker">ESPAÇOS DE MAGIA</span>
            <span className="hint">Use + e − para ajustar cada nível</span>
          </div>
          <div className="slot-editor">
            {slots.slice(1).map((value, index) => (
              <div key={index}>
                <span>Nível {index + 1}</span>
                <button
                  type="button"
                  onClick={() =>
                    setSlots(v =>
                      v.map((n, i) =>
                        i === index + 1 ? Math.max(0, n - 1) : n
                      )
                    )
                  }
                >
                  −
                </button>
                <b>{value}</b>
                <button
                  type="button"
                  onClick={() =>
                    setSlots(v =>
                      v.map((n, i) =>
                        i === index + 1 ? Math.min(20, n + 1) : n
                      )
                    )
                  }
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="form-section">
          <div className="section-head">
            <span className="section-kicker">MAGIAS INICIAIS</span>
            <button type="button" className="small-action" onClick={addSpell}>
              <Plus size={13} /> Adicionar magia
            </button>
          </div>
          <div className="starter-resource-list">
            {spells.map((spell, index) => (
              <div className="starter-resource-row" key={spell.id}>
                <input
                  value={spell.name}
                  onChange={e =>
                    setSpells(v =>
                      v.map((item, i) =>
                        i === index ? { ...item, name: e.target.value } : item
                      )
                    )
                  }
                />
                <select
                  value={spell.level}
                  onChange={e =>
                    setSpells(v =>
                      v.map((item, i) =>
                        i === index
                          ? { ...item, level: Number(e.target.value) }
                          : item
                      )
                    )
                  }
                >
                  {[0, 1, 2, 3, 4, 5].map(n => (
                    <option value={n} key={n}>
                      Nível {n}
                    </option>
                  ))}
                </select>
                <label>
                  <input
                    type="checkbox"
                    checked={spell.prepared}
                    onChange={e =>
                      setSpells(v =>
                        v.map((item, i) =>
                          i === index
                            ? { ...item, prepared: e.target.checked }
                            : item
                        )
                      )
                    }
                  />{" "}
                  Preparada
                </label>
                <button
                  type="button"
                  className="icon-btn icon-danger"
                  onClick={() =>
                    setSpells(v => v.filter(item => item.id !== spell.id))
                  }
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="form-section">
          <div className="section-head">
            <span className="section-kicker">HABILIDADES INICIAIS</span>
            <button type="button" className="small-action" onClick={addFeature}>
              <Plus size={13} /> Adicionar habilidade
            </button>
          </div>
          <div className="starter-resource-list">
            {features.map((feature, index) => (
              <div className="starter-resource-row" key={feature.id}>
                <input
                  value={feature.name}
                  onChange={e =>
                    setFeatures(v =>
                      v.map((item, i) =>
                        i === index ? { ...item, name: e.target.value } : item
                      )
                    )
                  }
                />
                <input
                  value={feature.type ?? "passive"}
                  onChange={e =>
                    setFeatures(v =>
                      v.map((item, i) =>
                        i === index ? { ...item, type: e.target.value } : item
                      )
                    )
                  }
                  placeholder="Tipo"
                />
                <button
                  type="button"
                  className="icon-btn icon-danger"
                  onClick={() =>
                    setFeatures(v => v.filter(item => item.id !== feature.id))
                  }
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="button primary">
            <Plus size={16} /> Criar personagem
          </button>
        </div>
      </form>
    </div>
  );
}
function Dashboard({
  characters,
  onOpen,
  onDelete,
  onCreate,
  onImport,
  onExport,
}: {
  characters: Character[];
  onOpen: (c: Character) => void;
  onDelete: (c: Character) => void;
  onCreate: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: (c: Character) => void;
}) {
  return (
    <div className="app-shell">
      <aside className="rail">
        <div className="brand">
          <img src="/manus-storage/ironbound-mark_65c5a816.png" alt="" />
          <span>
            IRONBOUND
            <br />
            <b>LEDGER</b>
          </span>
        </div>
        <div className="rail-rule" />
        <div className="rail-label">DIÁRIO DA CAMPANHA</div>
        <div className="rail-item active">
          <ScrollText size={17} /> Personagens{" "}
          <span className="rail-count">{characters.length}/3</span>
        </div>
        <div className="rail-item muted">
          <Swords size={17} /> Kit de encontro
        </div>
        <div className="rail-item muted">
          <CircleHelp size={17} /> Arquivo de regras
        </div>
        <div className="rail-bottom">
          <div className="sync-dot" />
          <span>
            Salvo localmente
            <br />
            <small>Pronto para uso offline</small>
          </span>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">REGISTRO DO AVENTUREIRO · 5E</div>
            <h1>
              Sua campanha, <em>pronta para a próxima sessão.</em>
            </h1>
          </div>
          <div className="top-actions">
            <label className="button secondary">
              <Import size={16} /> Importar personagem
              <input
                type="file"
                accept=".dndchar,.json"
                onChange={onImport}
                hidden
              />
            </label>
            <button
              className="button primary"
              onClick={onCreate}
              disabled={characters.length >= 3}
            >
              <Plus size={17} /> Novo personagem
            </button>
          </div>
        </header>
        <section className="intro-band">
          <div>
            <span className="section-kicker">GRUPO ATIVO</span>
            <p>
              {characters.length === 0
                ? "O registro aguarda seu primeiro nome."
                : `${characters.length} ${characters.length === 1 ? "personagem está" : "personagens estão"} marcados para a próxima sessão.`}
            </p>
          </div>
          <div className="legend">
            <span>
              <i className="legend-dot amber" /> PV atual
            </span>
            <span>
              <i className="legend-dot green" /> Salvo localmente
            </span>
          </div>
        </section>
        <section className="character-grid">
          {characters.map((c, index) => (
            <article
              className="character-card"
              key={c.id}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="card-top">
                <div className="avatar">{avatarLabel(c)}</div>
                <div className="card-meta">
                  <span className="eyebrow">
                    {String(index + 1).padStart(2, "0")} / PERSONAGEM
                  </span>
                  <h2>{c.name}</h2>
                  <p>
                    {c.race} <span>·</span> {c.className} <span>·</span> Nível{" "}
                    {c.level}
                  </p>
                </div>
                <IconButton
                  label={`Excluir ${c.name}`}
                  danger
                  onClick={() => onDelete(c)}
                >
                  <Trash2 size={17} />
                </IconButton>
              </div>
              <div className="card-stats">
                <div>
                  <span>STATUS DE PV</span>
                  <strong>
                    {c.hp}
                    <small> / {c.maxHp}</small>
                  </strong>
                  <div className="hp-line">
                    <i
                      style={{
                        width: `${Math.max(4, (c.hp / c.maxHp) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <span>CLASSE DE ARMADURA</span>
                  <strong>{c.ac}</strong>
                </div>
                <div>
                  <span>INICIATIVA</span>
                  <strong>{signed(c.initiative)}</strong>
                </div>
              </div>
              <div className="card-footer">
                <button className="open-link" onClick={() => onOpen(c)}>
                  Abrir ficha <ChevronRight size={17} />
                </button>
                <button className="export-link" onClick={() => onExport(c)}>
                  <Download size={15} /> Exportar
                </button>
              </div>
            </article>
          ))}
          {characters.length < 3 && (
            <button className="create-card" onClick={onCreate}>
              <span className="create-mark">
                <Plus size={22} />
              </span>
              <span>
                <b>Adicionar personagem</b>
                <small>Espaço {characters.length + 1} de 3 disponíveis</small>
              </span>
              <ChevronRight size={18} />
            </button>
          )}
        </section>
        <section className="dashboard-foot">
          <div className="quote-mark">“</div>
          <div>
            <p>Um bom registro lembra o que o aventureiro esquece.</p>
            <span>— Nota de campo, recuperada do Vale Cinzento</span>
          </div>
          <img
            src="/manus-storage/ironbound-dice_594d6277.jpg"
            alt="Dados e pergaminho em luz de forja"
          />
        </section>
      </main>
    </div>
  );
}

function EditCharacterForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: Character;
  onCancel: () => void;
  onSave: (c: Character) => void;
}) {
  const [draft, setDraft] = useState(clone(initial));
  const setField = <K extends keyof Character>(key: K, value: Character[K]) =>
    setDraft(v => ({ ...v, [key]: value }));
  const setAbility = (a: AbilityKey, value: string) =>
    setDraft(v => ({
      ...v,
      abilities: {
        ...v.abilities,
        [a]: Math.max(1, Math.min(30, Number(value) || 0)),
      },
    }));
  const addEquipment = () =>
    setDraft(v => ({
      ...v,
      equipment: [...v.equipment, { name: "Novo item", qty: 1 }],
    }));
  const updateEquipment = (index: number, key: "name" | "qty", value: string) =>
    setDraft(v => ({
      ...v,
      equipment: v.equipment.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]: key === "qty" ? Math.max(1, Number(value) || 1) : value,
            }
          : item
      ),
    }));
  return (
    <div className="modal-backdrop">
      <form
        className="modal character-form edit-form"
        onSubmit={e => {
          e.preventDefault();
          onSave(draft);
          onCancel();
          toast.success("Personagem atualizado", {
            description: "O registro salvou suas alterações localmente.",
          });
        }}
      >
        <button type="button" className="modal-close" onClick={onCancel}>
          <X size={18} />
        </button>
        <div className="modal-icon">
          <ScrollText size={23} />
        </div>
        <div className="eyebrow">EDITAR PERSONAGEM · REGISTRO LOCAL</div>
        <h2>Reescreva o registro.</h2>
        <p className="form-note">
          As alterações serão salvas assim que você confirmar este formulário.
        </p>
        <div className="form-section">
          <span className="section-kicker">IDENTIDADE</span>
          <div className="form-grid three">
            <label>
              Nome
              <input
                value={draft.name}
                onChange={e => setField("name", e.target.value)}
              />
            </label>
            <label>
              Raça
              <input
                value={draft.race}
                onChange={e => setField("race", e.target.value)}
              />
            </label>
            <label>
              Classe
              <input
                value={draft.className}
                onChange={e => setField("className", e.target.value)}
              />
            </label>
          </div>
          <label className="avatar-upload">
            {draft.avatar ? (
              <img
                className="avatar-preview"
                src={draft.avatar}
                alt="Preview do avatar"
              />
            ) : (
              <span className="avatar-preview initials-preview">
                {initials(draft.name)}
              </span>
            )}
            <span>
              <b>{draft.avatar ? "Replace avatar" : "Add an avatar"}</b>
              <small>PNG, JPG ou WebP · máximo 2 MB</small>
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!file.type.startsWith("image/"))
                  return toast.error("Choose an image file");
                if (file.size > 2 * 1024 * 1024)
                  return toast.error("Avatar is too large", {
                    description: "Use an image up to 2 MB.",
                  });
                const reader = new FileReader();
                reader.onload = () => setField("avatar", String(reader.result));
                reader.readAsDataURL(file);
              }}
              hidden
            />
          </label>
        </div>
        <div className="form-section">
          <span className="section-kicker">COMBATE E PROGRESSÃO</span>
          <div className="form-grid five">
            <label>
              Nível
              <input
                type="number"
                min="1"
                max="20"
                value={draft.level}
                onChange={e => {
                  const level = Number(e.target.value);
                  setDraft(v => ({
                    ...v,
                    level,
                    proficiency: level >= 5 ? 3 : level >= 9 ? 4 : 2,
                  }));
                }}
              />
            </label>
            <label>
              PV máximos
              <input
                type="number"
                min="1"
                value={draft.maxHp}
                onChange={e =>
                  setDraft(v => ({
                    ...v,
                    maxHp: Number(e.target.value),
                    hp: Math.min(v.hp, Number(e.target.value)),
                  }))
                }
              />
            </label>
            <label>
              Classe de armadura
              <input
                type="number"
                min="1"
                value={draft.ac}
                onChange={e => setField("ac", Number(e.target.value))}
              />
            </label>
            <label>
              Deslocamento
              <input
                type="number"
                min="0"
                value={draft.speed}
                onChange={e => setField("speed", Number(e.target.value))}
              />
            </label>
            <label>
              Iniciativa
              <input
                type="number"
                value={draft.initiative}
                onChange={e => setField("initiative", Number(e.target.value))}
              />
            </label>
          </div>
        </div>
        <div className="form-section">
          <div className="section-head">
            <span className="section-kicker">ESPAÇOS DE MAGIA</span>
            <span className="hint">
              Ajuste os espaços disponíveis por nível
            </span>
          </div>
          <div className="slot-editor">
            {draft.spellSlots.slice(1).map((value, index) => (
              <div key={index}>
                <span>Nível {index + 1}</span>
                <button
                  type="button"
                  onClick={() =>
                    setDraft(v => ({
                      ...v,
                      spellSlots: v.spellSlots.map((n, i) =>
                        i === index + 1 ? Math.max(0, n - 1) : n
                      ),
                      spentSlots: v.spentSlots.map((n, i) =>
                        i === index + 1
                          ? Math.min(n, Math.max(0, v.spellSlots[i] - 1))
                          : n
                      ),
                    }))
                  }
                >
                  −
                </button>
                <b>{value}</b>
                <button
                  type="button"
                  onClick={() =>
                    setDraft(v => ({
                      ...v,
                      spellSlots: v.spellSlots.map((n, i) =>
                        i === index + 1 ? Math.min(20, n + 1) : n
                      ),
                    }))
                  }
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="form-section">
          <span className="section-kicker">ATRIBUTOS</span>
          <div className="form-grid six">
            {abilityLabels.map(a => (
              <label key={a}>
                {a}
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={draft.abilities[a]}
                  onChange={e => setAbility(a, e.target.value)}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="form-section">
          <span className="section-kicker">MOEDAS</span>
          <div className="form-grid three">
            <label>
              Ouro
              <input
                type="number"
                min="0"
                value={draft.gold}
                onChange={e => setField("gold", Number(e.target.value))}
              />
            </label>
            <label>
              Prata
              <input
                type="number"
                min="0"
                value={draft.silver}
                onChange={e => setField("silver", Number(e.target.value))}
              />
            </label>
            <label>
              Cobre
              <input
                type="number"
                min="0"
                value={draft.copper}
                onChange={e => setField("copper", Number(e.target.value))}
              />
            </label>
          </div>
        </div>
        <div className="form-section">
          <div className="section-head">
            <span className="section-kicker">EQUIPAMENTOS</span>
            <button
              type="button"
              className="small-action"
              onClick={addEquipment}
            >
              <Plus size={13} /> Adicionar item
            </button>
          </div>
          <div className="equipment-editor">
            {draft.equipment.map((item, i) => (
              <div className="equipment-edit-row" key={`${i}-${item.name}`}>
                <input
                  value={item.name}
                  onChange={e => updateEquipment(i, "name", e.target.value)}
                  aria-label="Nome do equipamento"
                />
                <input
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={e => updateEquipment(i, "qty", e.target.value)}
                  aria-label="Quantidade do equipamento"
                />
                <button
                  type="button"
                  className="icon-btn icon-danger"
                  onClick={() =>
                    setDraft(v => ({
                      ...v,
                      equipment: v.equipment.filter((_, index) => index !== i),
                    }))
                  }
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="button primary">
            <ScrollText size={16} /> Salvar alterações
          </button>
        </div>
      </form>
    </div>
  );
}

function RecursosPanel({
  character: c,
  onUpdate,
}: {
  character: Character;
  onUpdate: (patch: Partial<Character>) => void;
}) {
  const spells = c.spellbook ?? [];
  const attacks = c.attacks ?? [];
  const features = c.classFeatures ?? [];
  const [spellLevel, setSpellLevel] = useState("all");
  const [spellPrepared, setSpellPrepared] = useState("all");
  const [spellSort, setSpellSort] = useState("level");
  const [featureType, setFeatureType] = useState("all");
  const [featureSort, setFeatureSort] = useState("name");
  const updateSpell = (id: string, patch: Partial<Spell>) =>
    onUpdate({
      spellbook: spells.map(item =>
        item.id === id ? { ...item, ...patch } : item
      ),
    });
  const updateAttack = (id: string, patch: Partial<Attack>) =>
    onUpdate({
      attacks: attacks.map(item =>
        item.id === id ? { ...item, ...patch } : item
      ),
    });
  const updateFeature = (id: string, patch: Partial<ClassFeature>) =>
    onUpdate({
      classFeatures: features.map(item =>
        item.id === id ? { ...item, ...patch } : item
      ),
    });
  const toggleUses = (
    resource: "spell" | "feature",
    id: string,
    delta: number
  ) => {
    if (resource === "spell") {
      const item = spells.find(value => value.id === id);
      if (item)
        updateSpell(id, {
          used: Math.max(0, Math.min(item.uses, item.used + delta)),
        });
    } else {
      const item = features.find(value => value.id === id);
      if (item)
        updateFeature(id, {
          used: Math.max(0, Math.min(item.uses, item.used + delta)),
        });
    }
  };
  const field = (
    value: string | number,
    onChange: (value: string) => void,
    type: "text" | "number" = "text"
  ) => (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} />
  );
  const filteredSpells = [...spells]
    .filter(item => spellLevel === "all" || item.level === Number(spellLevel))
    .filter(
      item =>
        spellPrepared === "all" ||
        (spellPrepared === "prepared" ? item.prepared : !item.prepared)
    )
    .sort((a, b) =>
      spellSort === "name"
        ? a.name.localeCompare(b.name)
        : spellSort === "uses"
          ? a.used / Math.max(1, a.uses) - b.used / Math.max(1, b.uses)
          : a.level - b.level
    );
  const filteredFeatures = [...features]
    .filter(
      item => featureType === "all" || (item.type ?? "passive") === featureType
    )
    .sort((a, b) =>
      featureSort === "uses"
        ? a.used / Math.max(1, a.uses) - b.used / Math.max(1, b.uses)
        : a.name.localeCompare(b.name)
    );
  const select = (
    value: string,
    onChange: (value: string) => void,
    options: [string, string][]
  ) => (
    <select value={value} onChange={e => onChange(e.target.value)}>
      {options.map(([option, label]) => (
        <option value={option} key={option}>
          {label}
        </option>
      ))}
    </select>
  );
  return (
    <div className="resources-layout">
      <section className="panel resource-section">
        <div className="section-head">
          <div>
            <span className="section-kicker">GRIMÓRIO</span>
            <p className="resource-helper">
              Prepare magias, acompanhe usos e mantenha as notas à mão.
            </p>
          </div>
          <button
            className="small-action"
            onClick={() =>
              onUpdate({
                spellbook: [
                  ...spells,
                  {
                    id: crypto.randomUUID(),
                    name: "Nova magia",
                    level: 1,
                    prepared: true,
                    description: "",
                    uses: 0,
                    used: 0,
                    recoverShort: false,
                    recoverLong: true,
                  },
                ],
              })
            }
          >
            <Plus size={13} /> Adicionar magia
          </button>
        </div>
        <div className="resource-filters">
          <label>
            Nível{" "}
            {select(spellLevel, setSpellLevel, [
              ["all", "Todos os níveis"],
              ["0", "Truque"],
              ["1", "Nível 1"],
              ["2", "Nível 2"],
              ["3", "Nível 3"],
              ["4", "Nível 4"],
              ["5", "Nível 5"],
            ])}
          </label>
          <label>
            Preparadas{" "}
            {select(spellPrepared, setSpellPrepared, [
              ["all", "Todas as magias"],
              ["prepared", "Preparadas"],
              ["unprepared", "Não preparadas"],
            ])}
          </label>
          <label>
            Ordenar{" "}
            {select(spellSort, setSpellSort, [
              ["level", "Nível"],
              ["name", "Nome"],
              ["uses", "Usos restantes"],
            ])}
          </label>
        </div>
        <div className="resource-list">
          {filteredSpells.map(spell => (
            <div className="resource-card" key={spell.id}>
              <div className="resource-main">
                <div className="resource-title-row">
                  {field(spell.name, value =>
                    updateSpell(spell.id, { name: value })
                  )}
                  <label className="inline-field">
                    Nível{" "}
                    {field(
                      spell.level,
                      value => updateSpell(spell.id, { level: Number(value) }),
                      "number"
                    )}
                  </label>
                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={spell.prepared}
                      onChange={e =>
                        updateSpell(spell.id, { prepared: e.target.checked })
                      }
                    />{" "}
                    Preparadas
                  </label>
                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={spell.recoverShort ?? false}
                      onChange={e =>
                        updateSpell(spell.id, {
                          recoverShort: e.target.checked,
                        })
                      }
                    />{" "}
                    Descanso curto
                  </label>
                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={spell.recoverLong ?? true}
                      onChange={e =>
                        updateSpell(spell.id, { recoverLong: e.target.checked })
                      }
                    />{" "}
                    Descanso longo
                  </label>
                </div>
                {field(spell.description, value =>
                  updateSpell(spell.id, { description: value })
                )}
              </div>
              <div className="resource-actions">
                <div className="use-stepper">
                  <button
                    type="button"
                    onClick={() => toggleUses("spell", spell.id, -1)}
                    aria-label="Restaurar uso de magia"
                  >
                    −
                  </button>
                  <span>
                    {spell.uses - spell.used} / {spell.uses}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleUses("spell", spell.id, 1)}
                    aria-label="Gastar uso de magia"
                  >
                    +
                  </button>
                </div>
                <IconButton
                  label={"Remover " + spell.name}
                  danger
                  onClick={() =>
                    onUpdate({
                      spellbook: spells.filter(item => item.id !== spell.id),
                    })
                  }
                >
                  <Trash2 size={15} />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
        {spells.length > 0 && filteredSpells.length === 0 && (
          <div className="resource-empty">
            Nenhuma magia corresponde a estes filtros.
          </div>
        )}
        {spells.length === 0 && (
          <div className="resource-empty">
            Nenhuma magia registrada. Adicione a primeira para começar o
            grimório.
          </div>
        )}
      </section>
      <section className="panel resource-section">
        <div className="section-head">
          <div>
            <span className="section-kicker">ATAQUES E ARMAS</span>
            <p className="resource-helper">
              Mantenha bônus de ataque e fórmulas de dano prontos para a mesa.
            </p>
          </div>
          <button
            className="small-action"
            onClick={() =>
              onUpdate({
                attacks: [
                  ...attacks,
                  {
                    id: crypto.randomUUID(),
                    name: "Novo ataque",
                    bonus: 0,
                    damage: "1d6",
                    type: "physical",
                  },
                ],
              })
            }
          >
            <Plus size={13} /> Adicionar ataque
          </button>
        </div>
        <div className="resource-list">
          {attacks.map(attack => (
            <div className="resource-card attack-card" key={attack.id}>
              <div className="resource-main">
                <div className="resource-title-row">
                  {field(attack.name, value =>
                    updateAttack(attack.id, { name: value })
                  )}
                  {field(attack.type, value =>
                    updateAttack(attack.id, { type: value })
                  )}
                </div>
                <div className="resource-inline-grid">
                  <label>
                    Bônus de ataque{" "}
                    {field(
                      attack.bonus,
                      value =>
                        updateAttack(attack.id, { bonus: Number(value) }),
                      "number"
                    )}
                  </label>
                  <label>
                    Fórmula de dano{" "}
                    {field(attack.damage, value =>
                      updateAttack(attack.id, { damage: value })
                    )}
                  </label>
                </div>
              </div>
              <IconButton
                label={"Remover " + attack.name}
                danger
                onClick={() =>
                  onUpdate({
                    attacks: attacks.filter(item => item.id !== attack.id),
                  })
                }
              >
                <Trash2 size={15} />
              </IconButton>
            </div>
          ))}
        </div>
        {attacks.length === 0 && (
          <div className="resource-empty">
            Nenhum ataque registrado. Adicione uma arma, truque ou ataque
            especial.
          </div>
        )}
      </section>
      <section className="panel resource-section">
        <div className="section-head">
          <div>
            <span className="section-kicker">HABILIDADES DE CLASSE</span>
            <p className="resource-helper">
              Registre traços passivos, ações e habilidades de uso limitado.
            </p>
          </div>
          <button
            className="small-action"
            onClick={() =>
              onUpdate({
                classFeatures: [
                  ...features,
                  {
                    id: crypto.randomUUID(),
                    name: "Nova habilidade",
                    description: "",
                    type: "passive",
                    uses: 0,
                    used: 0,
                    recoverShort: true,
                    recoverLong: true,
                  },
                ],
              })
            }
          >
            <Plus size={13} /> Adicionar habilidade
          </button>
        </div>
        <div className="resource-filters">
          <label>
            Tipo{" "}
            {select(featureType, setFeatureType, [
              ["all", "Todos os tipos"],
              ["passive", "Passiva"],
              ["action", "Ação"],
              ["reaction", "Reação"],
              ["bonus", "Ação bônus"],
            ])}
          </label>
          <label>
            Ordenar{" "}
            {select(featureSort, setFeatureSort, [
              ["name", "Nome"],
              ["uses", "Usos restantes"],
            ])}
          </label>
        </div>
        <div className="resource-list">
          {filteredFeatures.map(feature => (
            <div className="resource-card feature-card" key={feature.id}>
              <div className="resource-main">
                <div className="resource-title-row">
                  {field(feature.name, value =>
                    updateFeature(feature.id, { name: value })
                  )}
                  {field(feature.type ?? "passive", value =>
                    updateFeature(feature.id, { type: value })
                  )}
                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={feature.recoverShort ?? false}
                      onChange={e =>
                        updateFeature(feature.id, {
                          recoverShort: e.target.checked,
                        })
                      }
                    />{" "}
                    Descanso curto
                  </label>
                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={feature.recoverLong ?? true}
                      onChange={e =>
                        updateFeature(feature.id, {
                          recoverLong: e.target.checked,
                        })
                      }
                    />{" "}
                    Descanso longo
                  </label>
                </div>
                {field(feature.description, value =>
                  updateFeature(feature.id, { description: value })
                )}
              </div>
              <div className="resource-actions">
                <div className="use-stepper">
                  <button
                    type="button"
                    onClick={() => toggleUses("feature", feature.id, -1)}
                    aria-label="Restaurar uso de habilidade"
                  >
                    −
                  </button>
                  <span>
                    {feature.uses - feature.used} / {feature.uses}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleUses("feature", feature.id, 1)}
                    aria-label="Gastar uso de habilidade"
                  >
                    +
                  </button>
                </div>
                <IconButton
                  label={"Remover " + feature.name}
                  danger
                  onClick={() =>
                    onUpdate({
                      classFeatures: features.filter(
                        item => item.id !== feature.id
                      ),
                    })
                  }
                >
                  <Trash2 size={15} />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
        {features.length > 0 && filteredFeatures.length === 0 && (
          <div className="resource-empty">
            Nenhuma habilidade corresponde a este tipo.
          </div>
        )}
        {features.length === 0 && (
          <div className="resource-empty">
            Nenhuma habilidade registrada. Adicione um traço ou recurso de uso
            limitado.
          </div>
        )}
      </section>
    </div>
  );
}
function Sheet({
  character: initial,
  onBack,
  onSave,
}: {
  character: Character;
  onBack: () => void;
  onSave: (c: Character) => void;
}) {
  const [c, setC] = useState(() => {
    const next = clone(initial);
    if (!next.spellbook?.length && next.spells.length)
      next.spellbook = next.spells.map((name, index) => ({
        id: crypto.randomUUID(),
        name,
        level: index < 2 ? 0 : 2,
        prepared: true,
        description: "",
        uses: 0,
        used: 0,
        recoverLong: true,
      }));
    return next;
  });
  const [tab, setTab] = useState<Tab>("combat");
  const [rest, setRest] = useState<"short" | "long" | null>(null);
  const [editing, setEditing] = useState(false);
  const [custom, setCustom] = useState("");
  const [attackQuery, setAttackQuery] = useState("");
  const [attackSort, setAttackSort] = useState("name");
  const [equipmentQuery, setEquipmentQuery] = useState("");
  const [equipmentSort, setEquipmentSort] = useState("name");
  useEffect(() => onSave(c), [c]);
  const update = (patch: Partial<Character>) =>
    setC(v => {
      const next = { ...v, ...patch };
      if (patch.spellbook) next.spells = patch.spellbook.map(item => item.name);
      if (patch.spellSlots)
        next.spentSlots = (v.spentSlots ?? []).map((spent, index) =>
          Math.min(spent, patch.spellSlots?.[index] ?? 0)
        );
      return next;
    });
  const hpChange = (amount: number) =>
    update({ hp: Math.max(0, Math.min(c.maxHp, c.hp + amount)) });
  const tempHpChange = (amount: number) =>
    update({ tempHp: Math.max(0, c.tempHp + amount) });
  const roll = (label: string, value: number) => {
    const die = Math.floor(Math.random() * 20) + 1;
    toast(`${label}: ${die} ${signed(value)} = ${die + value}`, {
      description:
        die === 20
          ? "Critical success."
          : die === 1
            ? "Critical failure."
            : "The die has spoken.",
    });
  };
  const longRest = () => {
    update({
      hp: c.maxHp,
      tempHp: 0,
      spentSlots: c.spentSlots.map(() => 0),
      spellbook: (c.spellbook ?? []).map(item =>
        item.recoverLong === false ? item : { ...item, used: 0 }
      ),
      classFeatures: (c.classFeatures ?? []).map(item =>
        item.recoverLong === false ? item : { ...item, used: 0 }
      ),
    });
    setRest(null);
    toast.success("Descanso longo concluído", {
      description:
        "PV, espaços e recursos configurados para descanso longo foram restaurados.",
    });
  };
  const shortRest = () => {
    const heal = Math.min(c.maxHp - c.hp, 7);
    update({
      hp: Math.min(c.maxHp, c.hp + heal),
      spellbook: (c.spellbook ?? []).map(item =>
        item.recoverShort ? { ...item, used: 0 } : item
      ),
      classFeatures: (c.classFeatures ?? []).map(item =>
        item.recoverShort ? { ...item, used: 0 } : item
      ),
    });
    setRest(null);
    toast.success(`Descanso curto restaurou ${heal} PV`, {
      description:
        "Os recursos configurados para descanso curto foram restaurados.",
    });
  };
  const spellDC = 8 + c.proficiency + mod(c.abilities[c.spellAbility]);
  const attacks = defaultAttacks(c);
  const filteredAttacks = attacks
    .filter(item =>
      `${item.name} ${item.type} ${item.damage}`
        .toLowerCase()
        .includes(attackQuery.toLowerCase())
    )
    .sort((a, b) =>
      attackSort === "bonus"
        ? b.bonus - a.bonus
        : attackSort === "damage"
          ? a.damage.localeCompare(b.damage)
          : a.name.localeCompare(b.name)
    );
  const filteredEquipment = c.equipment
    .filter(item =>
      item.name.toLowerCase().includes(equipmentQuery.toLowerCase())
    )
    .sort((a, b) =>
      equipmentSort === "quantity"
        ? b.qty - a.qty
        : a.name.localeCompare(b.name)
    );
  return (
    <div className="app-shell sheet-shell">
      <aside className="rail sheet-rail">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Painel
        </button>
        <div className="brand">
          <img src="/manus-storage/ironbound-mark_65c5a816.png" alt="" />
          <span>
            IRONBOUND
            <br />
            <b>LEDGER</b>
          </span>
        </div>
        <div className="rail-rule" />
        <div className="rail-label">ESTE PERSONAGEM</div>
        <div
          className={`rail-item ${tab === "combat" ? "active" : ""}`}
          onClick={() => setTab("combat")}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") setTab("combat");
          }}
        >
          <Shield size={17} /> Combate e base
        </div>
        <div
          className={`rail-item ${tab === "spells" ? "active" : ""}`}
          onClick={() => setTab("spells")}
        >
          <WandSparkles size={17} /> Magias e espaços
        </div>
        <div
          className={`rail-item ${tab === "inventory" ? "active" : ""}`}
          onClick={() => setTab("inventory")}
        >
          <Backpack size={17} /> Inventário
        </div>
        <div
          className={`rail-item ${tab === "resources" ? "active" : ""}`}
          onClick={() => setTab("resources")}
        >
          <Sparkles size={17} /> Recursos
        </div>
        <div className="rail-bottom">
          <div className="sync-dot" />
          <span>
            Salvo automaticamente
            <br />
            <small>Armazenamento local</small>
          </span>
        </div>
      </aside>
      <main className="main-content sheet-content">
        <header className="sheet-header">
          <div className="identity">
            <div className="avatar large">{avatarLabel(c)}</div>
            <div>
              <div className="eyebrow">FICHA DE PERSONAGEM · 5E</div>
              <h1>{c.name}</h1>
              <p>
                {c.race} <span>·</span> {c.className} <span>·</span> Nível{" "}
                {c.level}
              </p>
            </div>
          </div>
          <div className="rest-actions">
            <button
              className="button secondary"
              onClick={() => setEditing(true)}
            >
              <ScrollText size={16} /> Editar personagem
            </button>
            <button
              className="button secondary"
              onClick={() => setRest("short")}
            >
              <Flame size={16} /> Descanso curto
            </button>
            <button className="button primary" onClick={() => setRest("long")}>
              <RotateCcw size={16} /> Descanso longo
            </button>
          </div>
        </header>
        <div className="mobile-tabs">
          <button
            className={tab === "combat" ? "active" : ""}
            onClick={() => setTab("combat")}
          >
            Combate
          </button>
          <button
            className={tab === "spells" ? "active" : ""}
            onClick={() => setTab("spells")}
          >
            Magias
          </button>
          <button
            className={tab === "inventory" ? "active" : ""}
            onClick={() => setTab("inventory")}
          >
            Inventário
          </button>
          <button
            className={tab === "resources" ? "active" : ""}
            onClick={() => setTab("resources")}
          >
            Recursos
          </button>
        </div>
        {tab === "combat" && (
          <div className="sheet-grid">
            <section className="primary-column">
              <div className="panel hp-panel">
                <div className="panel-heading">
                  <span className="section-kicker">SINAIS VITAIS</span>
                  <HeartPulse size={19} />
                </div>
                <div className="hp-display">
                  <div>
                    <span>PV ATUAIS</span>
                    <strong>
                      {c.hp}
                      <small> / {c.maxHp}</small>
                    </strong>
                  </div>
                  <div className="temp-hp">
                    <span>PV TEMPORÁRIOS</span>
                    <b>{c.tempHp}</b>
                    <div className="temp-hp-controls">
                      <button
                        type="button"
                        onClick={() => tempHpChange(-1)}
                        aria-label="Remover 1 PV temporário"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => tempHpChange(1)}
                        aria-label="Adicionar 1 PV temporário"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="hp-meter">
                    <i style={{ width: `${(c.hp / c.maxHp) * 100}%` }} />
                  </div>
                </div>
                <div className="quick-actions">
                  <button onClick={() => hpChange(-5)}>
                    <Minus size={14} /> 5
                  </button>
                  <button onClick={() => hpChange(-1)}>
                    <Minus size={14} /> 1
                  </button>
                  <button
                    className="custom-input"
                    onClick={() => {
                      const n = Number(custom);
                      if (n) hpChange(n);
                      setCustom("");
                    }}
                  >
                    <input
                      value={custom}
                      onChange={e => setCustom(e.target.value)}
                      placeholder="Custom"
                      type="number"
                      onClick={e => e.stopPropagation()}
                    />
                    <span>±</span>
                  </button>
                  <button onClick={() => hpChange(1)}>
                    <Plus size={14} /> 1
                  </button>
                  <button onClick={() => hpChange(5)}>
                    <Plus size={14} /> 5
                  </button>
                </div>
              </div>
              <div className="panel">
                <div className="panel-heading">
                  <span className="section-kicker">ATRIBUTOS</span>
                  <span className="hint">Toque em um atributo para rolar</span>
                </div>
                <div className="ability-grid">
                  {abilityLabels.map(a => (
                    <button
                      className="ability"
                      key={a}
                      onClick={() => roll(`${a} check`, mod(c.abilities[a]))}
                    >
                      <span>{a}</span>
                      <strong>{c.abilities[a]}</strong>
                      <b>{signed(mod(c.abilities[a]))}</b>
                    </button>
                  ))}
                </div>
              </div>
              <div className="panel saves-panel">
                <div className="panel-heading">
                  <span className="section-kicker">TESTES DE RESISTÊNCIA</span>
                  <span className="hint">Proficiência +{c.proficiency}</span>
                </div>
                <div className="save-grid">
                  {abilityLabels.map(a => (
                    <button
                      key={a}
                      onClick={() =>
                        roll(
                          `${a} save`,
                          mod(c.abilities[a]) +
                            (a === "DEX" || a === "CON" ? c.proficiency : 0)
                        )
                      }
                    >
                      <span className="save-dot" /> {a}{" "}
                      <b>
                        {signed(
                          mod(c.abilities[a]) +
                            (a === "DEX" || a === "CON" ? c.proficiency : 0)
                        )}
                      </b>
                    </button>
                  ))}
                </div>
              </div>
            </section>
            <aside className="secondary-column">
              <div className="metric-row">
                <div className="metric">
                  <Shield size={18} />
                  <span>CLASSE DE ARMADURA</span>
                  <strong>{c.ac}</strong>
                </div>
                <div className="metric">
                  <Dices size={18} />
                  <span>INICIATIVA</span>
                  <strong>{signed(c.initiative)}</strong>
                </div>
                <div className="metric">
                  <ChevronRight size={18} />
                  <span>DESLOCAMENTO</span>
                  <strong>
                    {c.speed}
                    <small> ft</small>
                  </strong>
                </div>
              </div>
              <div className="panel skill-panel">
                <div className="panel-heading">
                  <span className="section-kicker">SENTIDOS PASSIVOS</span>
                </div>
                <div className="passive-row">
                  <span>Percepção passiva</span>
                  <b>{10 + mod(c.abilities.WIS) + c.proficiency}</b>
                </div>
                <div className="passive-row">
                  <span>Bônus de proficiência</span>
                  <b>+{c.proficiency}</b>
                </div>
                <div className="passive-row">
                  <span>CD de resistência</span>
                  <b>{spellDC}</b>
                </div>
              </div>
              <div className="panel dice-panel">
                <span className="section-kicker">ROLAGENS RÁPIDAS</span>
                <button onClick={() => roll("Initiative", c.initiative)}>
                  <Dices size={17} /> Rolar iniciativa{" "}
                  <b>{signed(c.initiative)}</b>
                </button>
                <button
                  onClick={() =>
                    roll("Perception", mod(c.abilities.WIS) + c.proficiency)
                  }
                >
                  <CircleHelp size={17} /> Teste de percepção{" "}
                  <b>{signed(mod(c.abilities.WIS) + c.proficiency)}</b>
                </button>
              </div>
            </aside>
          </div>
        )}
        {tab === "spells" && (
          <div className="content-layout">
            <section className="panel spell-hero">
              <div className="panel-heading">
                <span className="section-kicker">CONJURAÇÃO</span>
                <WandSparkles size={18} />
              </div>
              <div className="spell-stats">
                <div>
                  <span>ATRIBUTO</span>
                  <strong>{c.spellAbility}</strong>
                </div>
                <div>
                  <span>CD DE RESISTÊNCIA</span>
                  <strong>{spellDC}</strong>
                </div>
                <div>
                  <span>BÔNUS DE ATAQUE</span>
                  <strong>
                    {signed(c.proficiency + mod(c.abilities[c.spellAbility]))}
                  </strong>
                </div>
              </div>
              <p>
                As magias preparadas são agrupadas por nível. Toque em um espaço
                para marcá-lo como gasto.
              </p>
            </section>
            <section className="panel">
              <div className="panel-heading">
                <span className="section-kicker">ESPAÇOS DE MAGIA</span>
                <span className="hint">Disponíveis / gastos</span>
              </div>
              <div className="slots-list">
                {c.spellSlots.map(
                  (total, level) =>
                    total > 0 && (
                      <div className="slot-row" key={level}>
                        <span>Nível {level + 1}</span>
                        <div className="slot-dots">
                          {Array.from({ length: total }).map((_, i) => (
                            <button
                              key={i}
                              className={i < c.spentSlots[level] ? "spent" : ""}
                              onClick={() => {
                                const next = [...c.spentSlots];
                                next[level] = i < next[level] ? i : i + 1;
                                update({ spentSlots: next });
                              }}
                            />
                          ))}
                        </div>
                        <b>
                          {total - c.spentSlots[level]} / {total}
                        </b>
                      </div>
                    )
                )}
              </div>
            </section>
            <section className="panel spell-list">
              <div className="panel-heading">
                <span className="section-kicker">MAGIAS PREPARADAS</span>
              </div>
              <div className="spell-items">
                {(c.spellbook ?? [])
                  .filter(spell => spell.prepared)
                  .map(spell => (
                    <div key={spell.id}>
                      <span className="spell-level">
                        {spell.level === 0 ? "TRUQUE" : `NÍVEL ${spell.level}`}
                      </span>
                      <b>{spell.name}</b>
                      <ChevronRight size={15} />
                    </div>
                  ))}
              </div>
            </section>
          </div>
        )}
        {tab === "resources" && (
          <RecursosPanel character={c} onUpdate={update} />
        )}
        {tab === "inventory" && (
          <div className="content-layout inventory-layout">
            <section className="panel currency-panel">
              <div className="panel-heading">
                <span className="section-kicker">BOLSA DE MOEDAS</span>
                <Coins size={18} />
              </div>
              <div className="currency-grid">
                <div>
                  <span>CP</span>
                  <b>{c.copper}</b>
                </div>
                <div>
                  <span>SP</span>
                  <b>{c.silver}</b>
                </div>
                <div>
                  <span>GP</span>
                  <b>{c.gold}</b>
                </div>
              </div>
            </section>
            <section className="panel">
              <div className="panel-heading">
                <span className="section-kicker">ARMAS E ATAQUES</span>
                <Swords size={18} />
              </div>
              <div className="inventory-filters">
                <input
                  placeholder="Buscar ataques"
                  value={attackQuery}
                  onChange={e => setAttackQuery(e.target.value)}
                />
                <select
                  value={attackSort}
                  onChange={e => setAttackSort(e.target.value)}
                >
                  <option value="name">Ordenar by name</option>
                  <option value="bonus">Ordenar by bonus</option>
                  <option value="damage">Ordenar by damage</option>
                </select>
              </div>
              {filteredAttacks.map(attack => (
                <div className="weapon-row" key={attack.id}>
                  <b>{attack.name}</b>
                  <span>+{attack.bonus} to hit</span>
                  <span>
                    {attack.damage} {attack.type}
                  </span>
                </div>
              ))}
              {filteredAttacks.length === 0 && (
                <div className="resource-empty">
                  Nenhum ataque corresponde à busca.
                </div>
              )}
            </section>
            <section className="panel equipment">
              <div className="panel-heading">
                <span className="section-kicker">EQUIPAMENTOS</span>
                <Backpack size={18} />
              </div>
              <div className="inventory-filters">
                <input
                  placeholder="Buscar equipamentos"
                  value={equipmentQuery}
                  onChange={e => setEquipmentQuery(e.target.value)}
                />
                <select
                  value={equipmentSort}
                  onChange={e => setEquipmentSort(e.target.value)}
                >
                  <option value="name">Ordenar by name</option>
                  <option value="quantity">Ordenar by quantity</option>
                </select>
              </div>
              {filteredEquipment.map(item => (
                <div className="equipment-row" key={item.name}>
                  <Backpack size={16} />
                  <b>{item.name}</b>
                  <span>× {item.qty}</span>
                </div>
              ))}
              {filteredEquipment.length === 0 && (
                <div className="resource-empty">
                  Nenhum equipamento corresponde à busca.
                </div>
              )}
            </section>
          </div>
        )}
        {editing && (
          <EditCharacterForm
            initial={c}
            onCancel={() => setEditing(false)}
            onSave={next => {
              setC(next);
              onSave(next);
            }}
          />
        )}
        {rest && (
          <div className="modal-backdrop">
            <div className="modal">
              <button className="modal-close" onClick={() => setRest(null)}>
                <X size={18} />
              </button>
              <div className="modal-icon">
                <Flame size={24} />
              </div>
              <div className="eyebrow">
                {rest === "short" ? "SHORT REST" : "LONG REST"}
              </div>
              <h2>
                {rest === "short"
                  ? "Spend a hit die?"
                  : "Close the ledger for the night?"}
              </h2>
              <p>
                {rest === "short"
                  ? "A short rest will restore a measured amount of HP from one hit die."
                  : "Descanso longo restores HP to maximum, resets spell slots and replenishes resource pools."}
              </p>
              <div className="modal-actions">
                <button
                  className="button secondary"
                  onClick={() => setRest(null)}
                >
                  Not yet
                </button>
                <button
                  className="button primary"
                  onClick={rest === "short" ? shortRest : longRest}
                >
                  Confirm rest
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  const [characters, setPersonagens] = useState<Character[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE);
      return saved ? JSON.parse(saved) : starterCharacters;
    } catch {
      return starterCharacters;
    }
  });
  const [active, setActive] = useState<Character | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Character | null>(null);
  const [creating, setCreating] = useState(false);
  useEffect(
    () => localStorage.setItem(STORAGE, JSON.stringify(characters)),
    [characters]
  );
  const saveCharacter = (next: Character) =>
    setPersonagens(list => list.map(c => (c.id === next.id ? next : c)));
  const create = () => {
    if (characters.length >= 3)
      return toast.error("Maximum of 3 characters reached", {
        description: "Delete one character before creating another.",
      });
    setCreating(true);
  };
  const finishCreate = (newC: Character) => {
    setPersonagens(list => [...list, newC]);
    setCreating(false);
    setActive(newC);
    toast.success(`${newC.name} joined the roster`, {
      description: "Your new character was saved locally.",
    });
  };
  const remove = () => {
    if (deleteTarget) {
      setPersonagens(list => list.filter(c => c.id !== deleteTarget.id));
      toast.success(`${deleteTarget.name} removed from the ledger`);
      setDeleteTarget(null);
    }
  };
  const exportCharacter = (c: Character) => {
    const payload = JSON.stringify(c);
    const file = {
      appSignature: "DND_SHEET_APP_V1",
      checksum: hash(payload),
      payload: c,
    };
    const blob = new Blob([JSON.stringify(file, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${c.name.toLowerCase().replace(/\s+/g, "-")}.dndchar`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Character exported", {
      description: "Signature and checksum included.",
    });
  };
  const importCharacter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const payload = JSON.stringify(parsed.payload);
        if (
          parsed.appSignature !== "DND_SHEET_APP_V1" ||
          parsed.checksum !== hash(payload) ||
          !parsed.payload?.name ||
          !parsed.payload?.abilities
        )
          throw new Error();
        if (characters.length >= 3)
          return toast.error("Maximum of 3 characters reached", {
            description: "Delete one character before importing.",
          });
        const imported = { ...parsed.payload, id: crypto.randomUUID() };
        setPersonagens(list => [...list, imported]);
        toast.success("Character imported", {
          description: `${imported.name} joined the roster.`,
        });
      } catch {
        toast.error(
          "Invalid or corrupted character file. File could not be read."
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  if (active)
    return (
      <Sheet
        character={active}
        onBack={() => setActive(null)}
        onSave={saveCharacter}
      />
    );
  return (
    <>
      <Dashboard
        characters={characters}
        onOpen={setActive}
        onDelete={setDeleteTarget}
        onCreate={create}
        onImport={importCharacter}
        onExport={exportCharacter}
      />
      {creating && (
        <CharacterForm
          onCancel={() => setCreating(false)}
          onCreate={finishCreate}
        />
      )}
      {deleteTarget && (
        <div className="modal-backdrop">
          <div className="modal">
            <button
              className="modal-close"
              onClick={() => setDeleteTarget(null)}
            >
              <X size={18} />
            </button>
            <div className="modal-icon danger">
              <Trash2 size={23} />
            </div>
            <div className="eyebrow">REMOVER PERSONAGEM</div>
            <h2>Apagar {deleteTarget.name}?</h2>
            <p>
              Esta ação remove o registro local da sua ficha. Exporte o
              personagem antes se quiser manter uma cópia.
            </p>
            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Manter personagem
              </button>
              <button className="button danger-button" onClick={remove}>
                Excluir permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
