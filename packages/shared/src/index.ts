export interface UnicodeChar {
  codepoint: number;
  hex: string;
  name: string;
  category: string;
  block: string;
}

export function codepointToHex(cp: number): string {
  return cp.toString(16).toUpperCase().padStart(4, "0");
}

export function utf8Bytes(cp: number): number[] {
  return Array.from(new TextEncoder().encode(String.fromCodePoint(cp)));
}

export function utf16Units(cp: number): number[] {
  const s = String.fromCodePoint(cp);
  const units: number[] = [];
  for (let i = 0; i < s.length; i++) {
    units.push(s.charCodeAt(i));
  }
  return units;
}

export function escapeForms(cp: number) {
  const hex = codepointToHex(cp);
  return {
    js: cp <= 0xffff ? `\\u${hex}` : `\\u{${hex}}`,
    hexEsc: Array.from(String.fromCodePoint(cp), (c) => {
      const h = c.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0");
      return `\\u${h}`;
    }).join(""),
    htmlEntity: `&#x${hex};`,
  };
}

export { lookupRecord, categoryLabel } from "./ucd.js";
export type { UcdRecord, UcdJson } from "./ucd.js";
export { isEmoji } from "./isEmoji.js";
export { analyzeEmoji } from "./emoji.js";
export type { EmojiComponent, EmojiCluster } from "./emoji.js";
export { normalizeAll, normalizationDiff } from "./normalize.js";
export type { NormalizationForms } from "./normalize.js";
