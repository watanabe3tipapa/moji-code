#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { codepointToHex, utf8Bytes, utf16Units, escapeForms } from "@moji/shared";

interface UcdRecord {
  n: string;
  c: string;
  b: string;
}

function loadUcd(): Record<string, UcdRecord> | null {
  const paths = [
    // Development: from packages/web/public/
    resolve(dirname(fileURLToPath(import.meta.url)), "../../web/public/ucd.json"),
    // Production: relative to the installed package
    resolve(dirname(fileURLToPath(import.meta.url)), "../ucd.json"),
    // Fallback: cwd
    resolve(process.cwd(), "ucd.json"),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      try {
        const data = JSON.parse(readFileSync(p, "utf-8"));
        return data.records ?? data;
      } catch {
        continue;
      }
    }
  }
  return null;
}

function lookupName(records: Record<string, UcdRecord> | null, cp: number): string | undefined {
  if (!records) return undefined;
  const hex = cp.toString(16).toUpperCase().padStart(4, "0");
  const keys = [hex, hex.padStart(5, "0"), hex.padStart(6, "0")];
  for (const k of keys) {
    const r = records[k];
    if (r?.n) return r.n;
    if (r && typeof r === "string") return r as unknown as string;
  }
  return undefined;
}

function analyze(ch: string, records: Record<string, UcdRecord> | null) {
  const cp = ch.codePointAt(0)!;
  const hex = codepointToHex(cp);
  const utf8 = utf8Bytes(cp).map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ");
  const utf16 = utf16Units(cp).map((u) => u.toString(16).padStart(4, "0").toUpperCase()).join(" ");
  const esc = escapeForms(cp);
  const name = lookupName(records, cp);

  return {
    char: ch,
    codepoint: cp,
    hex,
    name: name ?? "—",
    utf8,
    utf16,
    jsEscape: esc.js,
    htmlEntity: esc.htmlEntity,
  };
}

function formatText(result: ReturnType<typeof analyze>) {
  return [
    `${result.char}  U+${result.hex}  ${result.name}`,
    `  UTF-8:  ${result.utf8}`,
    `  UTF-16: ${result.utf16}`,
    `  JS:     ${result.jsEscape}`,
    `  HTML:   ${result.htmlEntity}`,
  ].join("\n");
}

const args = process.argv.slice(2);
const jsonFlag = args.includes("--json");
const inputArgs = args.filter((a) => a !== "--json");

if (inputArgs.length === 0) {
  console.error("Usage: moji <char|U+XXXX|text> [--json]");
  process.exit(1);
}

const records = loadUcd();

for (const input of inputArgs) {
  if (/^U\+[0-9A-Fa-f]+$/.test(input)) {
    const cp = parseInt(input.slice(2), 16);
    const result = analyze(String.fromCodePoint(cp), records);
    if (jsonFlag) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(formatText(result));
    }
  } else {
    const chars = Array.from(input);
    for (const ch of chars) {
      const result = analyze(ch, records);
      if (jsonFlag) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(formatText(result));
        if (chars.length > 1) console.log();
      }
    }
  }
}
