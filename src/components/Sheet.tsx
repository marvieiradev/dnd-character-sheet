import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    ArrowLeft,
    Backpack,
    ChevronRight,
    CircleHelp,
    Coins,
    Flame,
    HeartPulse,
    Minus,
    Plus,
    RotateCcw,
    Shield,
    Swords,
    WandSparkles,
    Dices,
    ScrollText,
    Sparkles,
    X,
} from "lucide-react";

import { type Character, type Tab } from "../types/dndTypes";

import {
    abilityLabels,
    avatarLabel,
    clone,
    defaultAttacks,
    mod,
    signed,
} from "../constants/dndConstants";
import { RecursosPanel } from "./RecursosPanel";
import { EditCharacterForm } from "./EditCharacterForm";

export function Sheet({
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
                    ? "Sucesso crítico."
                    : die === 1
                        ? "Falha crítica."
                        : "Os dados decidiram.",
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
                <div className="brand mb-2">
                    <img src="/logo.jpg" alt="" />
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
                    <Shield size={17} /> Combate
                </div>
                <div
                    className={`rail-item ${tab === "spells" ? "active" : ""}`}
                    onClick={() => setTab("spells")}
                >
                    <WandSparkles size={17} /> Magias
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
                                                    (a === "DES" || a === "CON" ? c.proficiency : 0)
                                                )
                                            }
                                        >
                                            <span className="save-dot" /> {a}{" "}
                                            <b>
                                                {signed(
                                                    mod(c.abilities[a]) +
                                                    (a === "DES" || a === "CON" ? c.proficiency : 0)
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
                                    <b>{10 + mod(c.abilities.SAB) + c.proficiency}</b>
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
                                        roll("Perception", mod(c.abilities.SAB) + c.proficiency)
                                    }
                                >
                                    <CircleHelp size={17} /> Teste de percepção{" "}
                                    <b>{signed(mod(c.abilities.SAB) + c.proficiency)}</b>
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
                                    <option value="name">Ordenar por nome</option>
                                    <option value="quantity">Ordenar por quantidade</option>
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
                                {rest === "short" ? "DESCANSO CURTO" : "DESCANSO LONGO"}
                            </div>
                            <h2>
                                {rest === "short"
                                    ? "Gastar um dado de vida?"
                                    : "Fechar o livro de contas para a noite?"}
                            </h2>
                            <p>
                                {rest === "short"
                                    ? "Um descanso curto restaurará uma quantidade determinada de PV a partir de um dado de vida."
                                    : "Um descanso longo restaura o PV ao máximo, redefine os espaços de magia e reabastece seus recursos."}
                            </p>
                            <div className="modal-actions">
                                <button
                                    className="button secondary"
                                    onClick={() => setRest(null)}
                                >
                                    Agora não
                                </button>
                                <button
                                    className="button primary"
                                    onClick={rest === "short" ? shortRest : longRest}
                                >
                                    Confirmar descanso
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
