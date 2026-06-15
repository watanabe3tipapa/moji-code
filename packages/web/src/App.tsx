import { useState, useEffect } from "react";
import { Routes, Route, Link, useSearchParams } from "react-router-dom";
import type { UcdRecord } from "@moji/shared";
import { useUcd } from "./hooks/useUcd";
import CodePointCard from "./components/CodePointCard";
import CodeTable from "./components/CodeTable";
import FontSelector from "./components/FontSelector";
import EmojiAnalyzer from "./components/EmojiAnalyzer";
import ExportBar from "./components/ExportBar";

function SearchPage() {
  const { lookup, loading } = useUcd();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState("");
  const [chars, setChars] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("mojiHistory") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("mojiHistory", JSON.stringify(history.slice(0, 20)));
  }, [history]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setInput(q);
  }, [searchParams]);

  function handleChange(value: string) {
    setInput(value);
    if (/^U\+[0-9A-Fa-f]+$/.test(value)) {
      const cp = parseInt(value.slice(2), 16);
      setChars([String.fromCodePoint(cp)]);
    } else if (value) {
      setChars(Array.from(value));
    } else {
      setChars([]);
    }
  }

  function handleSearch(value: string) {
    handleChange(value);
    if (value && !history.includes(value)) {
      setHistory((prev) => [value, ...prev].slice(0, 20));
    }
  }

  const results: { char: string; ucd: UcdRecord | null }[] = chars.map((ch) => ({
    char: ch,
    ucd: lookup(ch.codePointAt(0)!),
  }));

  return (
    <>
      <div className="search">
        <input
          className="input"
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch(input);
          }}
          placeholder="文字または U+XXXX を入力..."
          autoFocus
        />
      </div>
      {loading && <p className="small">Loading Unicode data...</p>}

      {results.length > 0 && <ExportBar results={results} />}

      <div className="cards">
        {chars.length === 0 ? (
          history.length > 0 && (
            <div className="history-card">
              <span className="label">Recent</span>
              <div className="history-tags">
                {history.map((h, i) => (
                  <button key={i} className="history-tag" onClick={() => handleSearch(h)}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )
        ) : (
          results.map((r, i) => <CodePointCard key={i} char={r.char} ucd={r.ucd} />)
        )}
      </div>
    </>
  );
}

function TablePage() {
  const { data } = useUcd();
  return <CodeTable ucd={data} />;
}

function EmojiPage() {
  return <EmojiAnalyzer />;
}

export default function App() {
  return (
    <div className="app">
      <header>
        <div className="header-top">
          <h1>文字コード超人</h1>
          <FontSelector />
        </div>
        <nav>
          <Link to="/">検索</Link>
          <Link to="/table">コード表</Link>
          <Link to="/emoji">絵文字</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/table" element={<TablePage />} />
        <Route path="/emoji" element={<EmojiAnalyzer />} />
      </Routes>
    </div>
  );
}
