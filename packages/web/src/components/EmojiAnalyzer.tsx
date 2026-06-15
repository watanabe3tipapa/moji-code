import { useState } from "react";
import { analyzeEmoji, isEmoji } from "@moji/shared";
import { useUcd } from "../hooks/useUcd";

export default function EmojiAnalyzer() {
  const [input, setInput] = useState("");
  const { records, loading } = useUcd();

  const clusters = input ? analyzeEmoji(input) : [];

  function lookupName(cp: number): string | undefined {
    if (!records) return undefined;
    const hex = cp.toString(16).toUpperCase().padStart(4, "0");
    const keys = [hex, hex.padStart(5, "0"), hex.padStart(6, "0")];
    for (const k of keys) {
      const r = (records as Record<string, { n: string }>)[k];
      if (r?.n) return r.n;
    }
    return undefined;
  }

  return (
    <div>
      <div className="search">
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="絵文字を入力（例: 🧑‍💻 👋🏻 🇯🇵 1️⃣）..."
        />
        {loading && <p className="small">Loading...</p>}
      </div>

      {clusters.length === 0 && <p className="small">絵文字を入力すると分解結果を表示します</p>}

      <div className="cards">
        {clusters.map((cluster, ci) => (
          <div className="card" key={ci}>
            <div className="card-header">
              <div className={`char ${isEmoji(cluster.input) ? "emoji" : ""}`}>
                {cluster.input}
              </div>
              <div className="card-id">
                <span className="label">Grapheme Cluster</span>
                <span className="small">
                  {cluster.components.length} codepoint
                  {cluster.components.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="emoji-tree">
              {cluster.components.map((comp, i) => (
                <div key={i} className="emoji-tree-row">
                  <div className="emoji-tree-indent">
                    {i > 0 && <span className="emoji-tree-branch">└─</span>}
                  </div>
                  <div className="emoji-tree-char">{comp.char}</div>
                  <div className="emoji-tree-info">
                    <div>
                      <strong>U+{comp.hex}</strong>{" "}
                      <span className="small">{lookupName(comp.codepoint) ?? "—"}</span>
                    </div>
                    <div className="emoji-tree-role">
                      <span className="kv">{comp.role}</span>
                      {comp.label && <span className="small"> {comp.label}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
