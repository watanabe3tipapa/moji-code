import type { UcdRecord } from "@moji/shared";
import { codepointToHex, categoryLabel } from "@moji/shared";

type Result = {
  char: string;
  ucd?: UcdRecord | null;
};

type Props = {
  results: Result[];
};

export default function ExportBar({ results }: Props) {
  if (results.length === 0) return null;

  function toCsv(): string {
    const header = "char,codepoint,hex,name,category,block";
    const rows = results.map((r) => {
      const cp = r.char.codePointAt(0)!;
      const hex = codepointToHex(cp);
      const name = r.ucd?.n ?? "";
      const cat = categoryLabel(r.ucd?.c ?? "");
      const block = r.ucd?.b ?? "";
      return `"${r.char}","U+${hex}","${name}","${cat}","${block}"`;
    });
    return [header, ...rows].join("\n");
  }

  function toJson(): string {
    return JSON.stringify(
      results.map((r) => ({
        char: r.char,
        codepoint: r.char.codePointAt(0),
        hex: codepointToHex(r.char.codePointAt(0)!),
        name: r.ucd?.n ?? null,
        category: r.ucd?.c ?? null,
        block: r.ucd?.b ?? null,
      })),
      null,
      2,
    );
  }

  function download(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="export-bar">
      <span className="label">Export</span>
      <button className="btn export-btn" onClick={() => download(toCsv(), "moji-export.csv", "text/csv")}>
        CSV
      </button>
      <button className="btn export-btn" onClick={() => download(toJson(), "moji-export.json", "application/json")}>
        JSON
      </button>
    </div>
  );
}
