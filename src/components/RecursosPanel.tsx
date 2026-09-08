import { useState } from "react";
import type { Attack, Character, ClassFeature, Spell } from "../types/dndTypes";
import { Plus, Trash2 } from "lucide-react";
import { IconButton } from "./IconButton";

export function RecursosPanel({
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
                                        type: "físico",
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
                                    <select
                                        value={attack.type}
                                        onChange={e => updateAttack(attack.id, { type: e.target.value })}
                                        className="select attack"
                                    >
                                        <option value="físico">Físico</option>
                                        <option value="mágico">Mágico</option>
                                    </select>
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
                                        type: "passiva",
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
                            ["passiva", "Passiva"],
                            ["ação", "Ação"],
                            ["reação", "Reação"],
                            ["bônus", "Ação bônus"],
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
                                    {field(feature.type ?? "passiva", value =>
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