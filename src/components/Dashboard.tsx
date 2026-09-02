import { ScrollText, Swords, CircleHelp, Import, Plus, Trash2, ChevronRight, Download } from "lucide-react";
import { avatarLabel, signed } from "../constants/dndConstants";
import type { Character } from "../types/dndTypes";
import { IconButton } from "./IconButton";

export function Dashboard({
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