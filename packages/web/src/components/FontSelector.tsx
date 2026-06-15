import { useEffect, useState } from "react";

type FontOption = {
  id: string;
  label: string;
  ui: string;
  mono?: string;
};

const FONT_OPTIONS: FontOption[] = [
  {
    id: "system",
    label: "System UI",
    ui: 'Inter, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Noto Mono", monospace',
  },
  {
    id: "inter",
    label: "Inter (UI) + Roboto Mono",
    ui: "Inter, system-ui, sans-serif",
    mono: '"Roboto Mono", ui-monospace, monospace',
  },
  {
    id: "noto-sans-jp",
    label: "Noto Sans JP",
    ui: '"Noto Sans JP", Inter, sans-serif',
    mono: '"Noto Sans JP", ui-monospace, monospace',
  },
  {
    id: "roboto-mono",
    label: "Roboto Mono (All)",
    ui: '"Roboto Mono", ui-monospace, monospace',
    mono: '"Roboto Mono", ui-monospace, monospace',
  },
  {
    id: "noto-serif-jp",
    label: "Noto Serif JP",
    ui: '"Noto Serif JP", "Noto Sans JP", serif',
    mono: 'ui-monospace, monospace',
  },
];

export default function FontSelector() {
  const [sel, setSel] = useState(() => localStorage.getItem("fontChoice") || "system");

  useEffect(() => {
    const opt = FONT_OPTIONS.find((o) => o.id === sel) ?? FONT_OPTIONS[0];
    document.documentElement.style.setProperty("--font-ui", opt.ui);
    document.documentElement.style.setProperty("--font-mono", opt.mono ?? opt.ui);
    localStorage.setItem("fontChoice", sel);
  }, [sel]);

  return (
    <div className="font-selector">
      <label className="label">Font</label>
      <select value={sel} onChange={(e) => setSel(e.target.value)} className="font-select">
        {FONT_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
