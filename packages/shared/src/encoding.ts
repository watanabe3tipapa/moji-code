import * as EncodingModule from "encoding-japanese";

// Node ESM は CJS を { default: ... } に包むが、Vite/esbuild は名前付きで展開する。
// 両環境で実体を取得できるようにする。
const Encoding: typeof EncodingModule =
  (EncodingModule as unknown as { default?: typeof EncodingModule }).default ?? EncodingModule;

/**
 * サポートする変換エンコーディング（バイト列表現）
 * - UTF8: 標準の UTF-8（TextEncoder）
 * - SJIS:  Shift_JIS
 * - EUCJP: EUC-JP
 * - JIS:   ISO-2022-JP
 * - UTF16: UTF-16 (LE, BOMなし)
 */
export type MojiEncoding = "UTF8" | "SJIS" | "EUCJP" | "JIS" | "UTF16";

export const MOJI_ENCODINGS: MojiEncoding[] = ["UTF8", "SJIS", "EUCJP", "JIS", "UTF16"];

export const ENCODING_LABELS: Record<MojiEncoding, string> = {
  UTF8: "UTF-8",
  SJIS: "Shift_JIS",
  EUCJP: "EUC-JP",
  JIS: "ISO-2022-JP",
  UTF16: "UTF-16 (LE)",
};

function utf16LEBytes(text: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const u = text.charCodeAt(i);
    bytes.push(u & 0xff, (u >> 8) & 0xff);
  }
  return bytes;
}

/**
 * 文字列を指定エンコーディングのバイト列（0-255）に変換する。
 * 変換できない文字が含まれる場合は例外を投げる。
 */
export function encodeBytes(text: string, encoding: MojiEncoding): number[] {
  if (!text) return [];
  switch (encoding) {
    case "UTF8":
      return Array.from(new TextEncoder().encode(text));
    case "UTF16":
      return utf16LEBytes(text);
    default: {
      const unicodeArray = Encoding.stringToCode(text);
      const bytes = Encoding.convert(unicodeArray, encoding, "UNICODE") as number[];
      // 変換できない文字が '?' に置き換えられていないか検証
      const roundTripOk = decodeBytes(bytes, encoding) === text;
      if (!roundTripOk) throw new Error(`Cannot convert to ${ENCODING_LABELS[encoding]}`);
      return bytes;
    }
  }
}

/**
 * バイト列を指定エンコーディングとして文字列にデコードする。
 */
export function decodeBytes(bytes: number[] | Uint8Array, encoding: MojiEncoding): string {
  const arr = Array.from(bytes);
  if (arr.length === 0) return "";
  switch (encoding) {
    case "UTF8":
      return new TextDecoder("utf-8").decode(Uint8Array.from(arr));
    case "UTF16": {
      const units: number[] = [];
      for (let i = 0; i < arr.length - 1; i += 2) {
        units.push(arr[i] | (arr[i + 1] << 8));
      }
      return String.fromCharCode(...units);
    }
    default: {
      const unicodeArray = Encoding.convert(arr, "UNICODE", encoding) as number[];
      return Encoding.codeToString(unicodeArray);
    }
  }
}

/**
 * 文字列がエンコーディングで表現可能か（往復変換で一致するか）。
 */
export function isConvertible(text: string, encoding: MojiEncoding): boolean {
  if (!text) return true;
  try {
    encodeBytes(text, encoding);
    return true;
  } catch {
    return false;
  }
}

export function bytesToHex(bytes: number[] | Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");
}

export function bytesToHexCompact(bytes: number[] | Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
    .join("");
}

export function bytesToBase64(bytes: number[] | Uint8Array): string {
  return Encoding.base64Encode(Array.from(bytes));
}

export function bytesToSafeString(bytes: number[] | Uint8Array): string {
  return Array.from(bytes)
    .filter((b) => b === 0x09 || b === 0x0a || b === 0x0d || (b >= 0x20 && b < 0x7f))
    .map((b) => String.fromCharCode(b))
    .join("");
}