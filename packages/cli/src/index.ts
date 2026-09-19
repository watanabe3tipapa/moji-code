#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  codepointToHex,
  utf8Bytes,
  utf16Units,
  escapeForms,
  encodeBytes,
  decodeBytes,
  bytesToHex,
  bytesToBase64,
  MOJI_ENCODINGS,
  ENCODING_LABELS,
} from "@moji/shared";
import type { MojiEncoding } from "@moji/shared";

interface UcdRecord {
  n: string;
  c: string;
  b: string;
}

const ENCODING_ALIASES: Record<string, MojiEncoding> = {};
for (const enc of MOJI_ENCODINGS) {
  ENCODING_ALIASES[enc.toLowerCase()] = enc;
  ENCODING_ALIASES[enc.toLowerCase().replace("utf16", "utf-16")] = enc;
}
ENCODING_ALIASES["shift_jis"] = "SJIS";
ENCODING_ALIASES["sjis"] = "SJIS";
ENCODING_ALIASES["euc-jp"] = "EUCJP";
ENCODING_ALIASES["eucjp"] = "EUCJP";
ENCODING_ALIASES["iso-2022-jp"] = "JIS";
ENCODING_ALIASES["utf-8"] = "UTF8";
ENCODING_ALIASES["utf-16le"] = "UTF16";
ENCODING_ALIASES["utf-16"] = "UTF16";

function normalizeEncoding(label: string | undefined): MojiEncoding | null {
  if (!label) return null;
  return ENCODING_ALIASES[label.toLowerCase().trim()] ?? null;
}

function usage() {
  console.error(`Usage: moji <char|U+XXXX|text> [--json]
       moji <text> --encode <UTF8|SJIS|EUCJP|JIS|UTF16>  [--base64]
       moji --decode <UTF8|SJIS|EUCJP|JIS|UTF16> <hex>   [--base64]`);
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

// --- 引数パース ---
const args = process.argv.slice(2);
const jsonFlag = args.includes("--json");
const base64Flag = args.includes("--base64");

const encodeIdx = args.indexOf("--encode");
const decodeIdx = args.indexOf("--decode");

const encodeTarget = encodeIdx >= 0 ? normalizeEncoding(args[encodeIdx + 1]) : null;
const decodeTarget = decodeIdx >= 0 ? normalizeEncoding(args[decodeIdx + 1]) : null;

const flags = new Set(["--json", "--base64", "--encode", "--decode"]);
const inputArgs = args.filter((a, i) => {
  if (flags.has(a)) return false;
  // --encode <enc> / --decode <enc> の値も除外
  if (encodeIdx >= 0 && i === encodeIdx + 1) return false;
  if (decodeIdx >= 0 && i === decodeIdx + 1) return false;
  return true;
});

if (inputArgs.length === 0) {
  usage();
  process.exit(1);
}

if (encodeIdx >= 0 && !encodeTarget) {
  console.error(`Unknown encoding. Available: ${MOJI_ENCODINGS.map((e) => ENCODING_LABELS[e]).join(", ")}`);
  process.exit(1);
}
if (decodeIdx >= 0 && !decodeTarget) {
  console.error(`Unknown encoding. Available: ${MOJI_ENCODINGS.map((e) => ENCODING_LABELS[e]).join(", ")}`);
  process.exit(1);
}

// --- エンコードモード ---
if (encodeTarget) {
  const text = inputArgs.join(" ");
  try {
    const bytes = encodeBytes(text, encodeTarget);
    const hex = bytesToHex(bytes);
    const out: Record<string, string> = {
      encoding: ENCODING_LABELS[encodeTarget],
      text,
      hex,
      byteCount: String(bytes.length),
    };
    if (base64Flag) out.base64 = bytesToBase64(bytes);
    if (jsonFlag) {
      console.log(JSON.stringify(out, null, 2));
    } else {
      console.log(`Text:     ${text}`);
      console.log(`Encoding: ${ENCODING_LABELS[encodeTarget]}`);
      console.log(`Bytes:    ${bytes.length}`);
      console.log(`Hex:      ${hex}`);
      if (out.base64) console.log(`Base64:   ${out.base64}`);
    }
    process.exit(0);
  } catch (e) {
    console.error(`Error: ${(e as Error).message}`);
    process.exit(1);
  }
}

// --- デコードモード ---
if (decodeTarget) {
  const hexArg = inputArgs.join("");
  const cleaned = hexArg.replace(/[\s,]+/g, "");
  if (!/^[0-9A-Fa-f]+$/.test(cleaned) || cleaned.length % 2 !== 0) {
    console.error("Error: hex bytes must be even-length hex digits (e.g. 82 A0 82 A2)");
    process.exit(1);
  }
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes.push(parseInt(cleaned.slice(i, i + 2), 16));
  }
  try {
    const text = decodeBytes(bytes, decodeTarget);
    const out: Record<string, string> = {
      encoding: ENCODING_LABELS[decodeTarget],
      hex: hexArg,
      text,
    };
    if (jsonFlag) {
      console.log(JSON.stringify(out, null, 2));
    } else {
      console.log(`Encoding: ${ENCODING_LABELS[decodeTarget]}`);
      console.log(`Hex:      ${hexArg}`);
      console.log(`Text:     ${text}`);
    }
    process.exit(0);
  } catch (e) {
    console.error(`Error: ${(e as Error).message}`);
    process.exit(1);
  }
}

// --- 通常の解析モード ---
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