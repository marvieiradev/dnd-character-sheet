import { useState } from "react";
import type { AbilityKey, Character, ClassFeature, Spell } from "../types/dndTypes";
import { X, Sparkles, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { spellFromName, featureFromName, classCatalog, initials, abilityLabels } from "../constants/dndConstants";

export function CharacterForm({
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
    const template = template(className);
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