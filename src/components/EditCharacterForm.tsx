import { useState } from "react";
import type { AbilityKey, Character } from "../types/dndTypes";
import { toast } from "sonner";
import { Plus, ScrollText, Trash2, X } from "lucide-react";
import { abilityLabels, classCatalog, clone, initials } from "../constants/dndConstants";

export function EditCharacterForm({
    initial,
    onCancel,
    onSave,
}: {
    initial: Character;
    onCancel: () => void;
    onSave: (c: Character) => void;
}) {
    const [draft, setDraft] = useState(clone(initial));
    console.log("draft", draft.avatar);
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
    function setClassNome(value: string): void {
        throw new Error("Function not implemented.");
    }

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
                            <select
                                value={draft.className}
                                onChange={e => setField("className", e.target.value)}
                                className="select"
                            >
                                {Object.keys(classCatalog).map(item => (
                                    <option key={item} value={item}>
                                        {
                                            (
                                                {
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
                                                } as Record<string, string>
                                            )[item]
                                        }
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <label className="avatar-upload">
                        {draft.avatar !== initials(draft.name) ? (
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
                            <b>{draft.avatar !== initials(draft.name) ? "Substituir avatar" : "Adicionar avatar"}</b>
                            <small>PNG, JPG ou WebP · máximo 2 MB</small>
                        </span>
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (!file.type.startsWith("image/"))
                                    return toast.error("Escolha um arquivo de imagem");
                                if (file.size > 2 * 1024 * 1024)
                                    return toast.error("A imagem é muito grande!", {
                                        description: "Use uam imagem menor que 2 MB.",
                                    });
                                const reader = new FileReader();
                                reader.onload = () => setField("avatar", String(reader.result));
                                reader.readAsDataURL(file);
                            }}
                            hidden
                        />
                    </label>
                    <div className="remove-avatar">
                        <button type="button" className="button secondary" onClick={() => setField("avatar", initials(draft.name))}>
                            <Trash2 size={15} />
                            Remover avatar
                        </button>
                    </div>

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
