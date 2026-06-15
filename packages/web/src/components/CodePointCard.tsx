import { useState } from "react";
import type { UcdRecord } from "@moji/shared";
import {
  codepointToHex,
  utf8Bytes,
  utf16Units,
  escapeForms,
  categoryLabel,
  isEmoji,
  normalizationDiff,
} from "@moji/shared";

type Props = {
  char: string;
  ucd?: UcdRecord | null;
};

export default function CodePointCard({ char, ucd }: Props) {
  const cp = char.codePointAt(0)!;
  const hex = codepointToHex(cp);
  const utf8 = utf8Bytes(cp).map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ");
  const utf16 = utf16Units(cp).map((u) => u.toString(16).padStart(4, "0").toUpperCase()).join(" ");
  const esc = escapeForms(cp);
  const emoji = isEmoji(char);
  const [showNorm, setShowNorm] = useState(false);

  const normDiffs = normalizationDiff(char).filter((n) => n.changed);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className={`char ${emoji ? "emoji" : ""}`}>{char}</div>
        <div className="card-id">
          <span className="label">U+{hex}</span>
          <span className="name">{ucd?.n ?? "—"}</span>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          <span className="label">Category</span>
          <span className="kv">{categoryLabel(ucd?.c ?? "")} ({ucd?.c ?? "—"})</span>
        </div>
        <div className="row">
          <span className="label">Block</span>
          <span className="kv">{ucd?.b ?? "—"}</span>
        </div>
        <div className="row">
          <span className="label">UTF-8</span>
          <span className="kv mono">{utf8}</span>
          <button className="copy-btn" onClick={() => copy(utf8)}>📋</button>
        </div>
        <div className="row">
          <span className="label">UTF-16</span>
          <span className="kv mono">{utf16}</span>
          <button className="copy-btn" onClick={() => copy(utf16)}>📋</button>
        </div>
        <div className="row">
          <span className="label">JS escape</span>
          <span className="kv mono">{esc.js}</span>
          <button className="copy-btn" onClick={() => copy(esc.js)}>📋</button>
        </div>
        <div className="row">
          <span className="label">HTML entity</span>
          <span className="kv mono">{esc.htmlEntity}</span>
          <button className="copy-btn" onClick={() => copy(esc.htmlEntity)}>📋</button>
        </div>

        {normDiffs.length > 0 && (
          <>
            <button className="btn norm-toggle" onClick={() => setShowNorm(!showNorm)}>
              {showNorm ? "▾" : "▸"} Normalization ({normDiffs.length} diff)
            </button>
            {showNorm && (
              <div className="norm-forms">
                {normDiffs.map((n) => (
                  <div key={n.form} className="row">
                    <span className="label">{n.form}</span>
                    <span className="kv mono">{n.codepoints.join(" ")}</span>
                    <span className="small">{n.text}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
