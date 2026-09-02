import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Trash2,
  X,
} from "lucide-react";

import {
  type Character,
} from "../types/dndTypes";

import {
  hash,
  starterCharacters,
  STORAGE,
} from "../constants/dndConstants";
import { Sheet } from "../components/Sheet";
import { Dashboard } from "../components/Dashboard";
import { CharacterForm } from "../components/CharacterForm";

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
