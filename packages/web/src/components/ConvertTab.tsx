import { useState } from "react";
import {
  ENCODING_LABELS,
  MOJI_ENCODINGS,
  bytesToBase64,
  bytesToHex,
  encodeBytes,
  isConvertible,
  decodeBytes,
} from "@moji/shared";
import type { MojiEncoding } from "@moji/shared";

function copy(text: string) {
  navigator.clipboard.writeText(text);
}

function ConvertTab() {
  const [input, setInput] = useState("");
  const [hexInput, setHexInput] = useState("");
  const [decodeEnc, setDecodeEnc] = useState<MojiEncoding>("SJIS");
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<string>("");

  const results = MOJI_ENCODINGS.map((enc) => {
    const convertible = isConvertible(input, enc);
    let bytes: number[] = [];
    let hex = "";
    let base64 = "";
    if (input && convertible) {
      try {
        bytes = encodeBytes(input, enc);
        hex = bytesToHex(bytes);
        base64 = bytesToBase64(bytes);
      } catch {
        /* unreachable due to convertible check */
      }
    }
    return { enc, convertible, hex, base64, byteCount: bytes.length };
  });

  function runDecode() {
    setDecodeError(null);
    setDecoded("");
    const cleaned = hexInput.replace(/[\s,]+/g, "");
    if (!cleaned) {
      setDecodeError("バイト列を入力してください");
      return;
    }
    if (!/^[0-9A-Fa-f]+$/.test(cleaned) || cleaned.length % 2 !== 0) {
      setDecodeError("16進数のバイト列（例: 82 A0 82 A2）を入力してください");
      return;
    }
    const bytes: number[] = [];
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes.push(parseInt(cleaned.slice(i, i + 2), 16));
    }
    try {
      setDecoded(decodeBytes(bytes, decodeEnc));
    } catch (e) {
      setDecodeError(`デコードに失敗しました: ${(e as Error).message}`);
    }
  }

  return (
    <div>
      <div className="convert-section">
        <div className="row">
          <span className="label">エンコード</span>
          <span className="small">テキスト → 各エンコーディングのバイト列</span>
        </div>
        <textarea
          className="input textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ここに変換したいテキストを入力（例: あいうえお / Hello 世界）..."
          rows={4}
        />
        <div className="small convert-count">{Array.from(input).length} characters</div>
      </div>

      {input && (
        <div className="cards convert-cards">
          {results.map(({ enc, convertible, hex, base64, byteCount }) => (
            <div className="card" key={enc}>
              <div className="convert-card-header">
                <span className="label">{ENCODING_LABELS[enc]}</span>
                <span className="small">{byteCount} bytes</span>
              </div>
              {convertible ? (
                <>
                  <div className="row">
                    <span className="label">Hex</span>
                    <div className="kv mono convert-hex">{hex}</div>
                    <button className="copy-btn" onClick={() => copy(hex)}>📋</button>
                  </div>
                  <div className="row">
                    <span className="label">Base64</span>
                    <span className="kv mono">{base64}</span>
                    <button className="copy-btn" onClick={() => copy(base64)}>📋</button>
                  </div>
                </>
              ) : (
                <p className="small warning">
                  ⚠️ このエンコーディングでは表現できない文字が含まれています
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="convert-section decode-section">
        <div className="row">
          <span className="label">デコード</span>
          <span className="small">バイト列 → テキスト（逆変換）</span>
        </div>
        <div className="search">
          <input
            className="input mono"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runDecode()}
            placeholder="バイト列を16進数で入力（例: 82 A0 82 A2 82 A4）..."
          />
        </div>
        <div className="row decode-controls">
          <select
            className="block-select"
            value={decodeEnc}
            onChange={(e) => setDecodeEnc(e.target.value as MojiEncoding)}
          >
            {MOJI_ENCODINGS.map((enc) => (
              <option key={enc} value={enc}>
                {ENCODING_LABELS[enc]}
              </option>
            ))}
          </select>
          <button className="btn" onClick={runDecode}>
            デコード
          </button>
        </div>
        {decodeError && <p className="small warning">{decodeError}</p>}
        {decoded && (
          <div className="decode-result">
            <div className="row">
              <span className="label">Result</span>
              <div className="kv mono convert-hex">{decoded}</div>
              <button className="copy-btn" onClick={() => copy(decoded)}>📋</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConvertTab;