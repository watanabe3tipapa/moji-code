import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { UcdJson } from "@moji/shared";
import { isEmoji } from "@moji/shared";

type Props = {
  ucd: UcdJson | null;
};

const PAGE_SIZE = 256;

export default function CodeTable({ ucd }: Props) {
  const navigate = useNavigate();
  const [selectedBlock, setSelectedBlock] = useState(0);
  const [page, setPage] = useState(0);

  const blocks = ucd?.blocks ?? [];

  const blockChars = useMemo(() => {
    if (!ucd || blocks.length === 0) return [];
    const block = blocks[selectedBlock];
    if (!block) return [];
    // We need the start/end of this block from the records
    const entries = Object.entries(ucd.records);
    const blockEntries = entries.filter(([, rec]) => rec.b === block);
    return blockEntries.map(([hex]) => {
      const cp = parseInt(hex, 16);
      return { cp, hex, char: String.fromCodePoint(cp) };
    });
  }, [ucd, blocks, selectedBlock]);

  const totalPages = Math.ceil(blockChars.length / PAGE_SIZE);
  const pageChars = blockChars.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleCharClick(hex: string) {
    navigate(`/?q=U+${hex}`);
  }

  return (
    <div>
      <div className="table-controls">
        <select
          value={selectedBlock}
          onChange={(e) => {
            setSelectedBlock(Number(e.target.value));
            setPage(0);
          }}
          className="block-select"
        >
          {blocks.map((name, i) => (
            <option key={i} value={i}>
              {name}
            </option>
          ))}
        </select>
        <span className="small">
          U+{pageChars[0]?.hex ?? "—"} – U+
          {pageChars[pageChars.length - 1]?.hex ?? "—"} ({blockChars.length} chars)
        </span>
      </div>

      <div className="table-grid">
        {pageChars.map(({ cp, hex, char }) => (
          <button
            key={hex}
            className={`table-cell ${isEmoji(char) ? "emoji" : ""}`}
            onClick={() => handleCharClick(hex)}
            title={`U+${hex}`}
          >
            {char}
          </button>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          <span className="small">
            {page + 1} / {totalPages}
          </span>
          <button
            className="btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
