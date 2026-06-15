/**
 * UCD (Unicode Character Database) パーサ
 *
 * UnicodeData.txt と Blocks.txt をダウンロードし、
 * コードポイント → { name, category, block } の JSON を生成する。
 *
 * 使い方: npx tsx scripts/parse-ucd.ts
 * 出力先: packages/web/public/ucd.json
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

// --- Download helpers ---

async function download(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  return res.text();
}

// --- UnicodeData.txt parser ---

interface UnicodeDataEntry {
  codepoint: number;
  name: string;
  category: string;
}

function parseUnicodeData(text: string): Map<number, UnicodeDataEntry> {
  const map = new Map<number, UnicodeDataEntry>();
  for (const line of text.split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    const fields = line.split(";");
    if (fields.length < 2) continue;
    const codepoint = parseInt(fields[0], 16);
    const name = fields[1];
    const category = fields[2] ?? "";
    // Skip ranges (<xxx, First> / <xxx, Last>)
    if (name.startsWith("<") && name.endsWith(", First>")) {
      const rangeStart = codepoint;
      const nextLine = text.slice(text.indexOf(line) + line.length + 1).split("\n")[0];
      const rangeEnd = parseInt(nextLine.split(";")[0], 16);
      const baseName = name.slice(1, -", First>".length - 1);
      for (let cp = rangeStart; cp <= rangeEnd; cp++) {
        map.set(cp, { codepoint: cp, name: `${baseName}-${cp.toString(16).toUpperCase().padStart(4, "0")}`, category });
      }
      // skip the next line (Last)
      continue;
    }
    if (name.startsWith("<") && name.endsWith(", Last>")) {
      continue; // already handled by First
    }
    map.set(codepoint, { codepoint, name, category });
  }
  return map;
}

// --- Blocks.txt parser ---

interface Block {
  start: number;
  end: number;
  name: string;
}

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    const [range, name] = line.split(";").map((s) => s.trim());
    if (!range || !name) continue;
    const [startStr, endStr] = range.split("..");
    blocks.push({
      start: parseInt(startStr, 16),
      end: parseInt(endStr, 16),
      name,
    });
  }
  return blocks;
}

function blockForCodepoint(cp: number, blocks: Block[]): string {
  for (const b of blocks) {
    if (cp >= b.start && cp <= b.end) return b.name;
  }
  return "Unknown";
}

// --- JSON output format ---

interface UcdRecord {
  n: string;  // name (shortened key for smaller JSON)
  c: string;  // category
  b: string;  // block
}

interface UcdJson {
  version: string;
  records: Record<string, UcdRecord>;
  blocks: string[];
}

// --- Main ---

async function main() {
  const BASE = "https://unicode.org/Public/UNIDATA";

  console.log("Downloading UnicodeData.txt...");
  const unicodeDataText = await download(`${BASE}/UnicodeData.txt`);

  console.log("Downloading Blocks.txt...");
  const blocksText = await download(`${BASE}/Blocks.txt`);

  console.log("Parsing...");
  const entries = parseUnicodeData(unicodeDataText);
  const blocks = parseBlocks(blocksText);

  console.log(`  ${entries.size} codepoints`);
  console.log(`  ${blocks.length} blocks`);

  // Extract block names (ordered)
  const blockNames = blocks.map((b) => b.name);

  // Build compact JSON
  const records: Record<string, UcdRecord> = {};
  for (const [cp, entry] of entries) {
    const hex = cp.toString(16).toUpperCase().padStart(4, "0");
    records[hex] = {
      n: entry.name,
      c: entry.category,
      b: blockForCodepoint(cp, blocks),
    };
  }

  const output: UcdJson = {
    version: "16.0.0",
    records,
    blocks: blockNames,
  };

  const outPath = resolve("packages/web/public/ucd.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(output));
  console.log(`Written: ${outPath} (${Object.keys(records).length} records)`);
}

main().catch(console.error);
