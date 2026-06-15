# DEV-MEMO

## プロジェクト概要

文字コード（Unicode）解析・検索・変換の便利ツール群。

- **① 文字コード超人**（Web App → GitHub Pages 公開）
- **② Moji CLI**（npm パッケージとして公開）
- **⑤ 絵文字分解ビジュアライザー**（①に統合）

## 技術スタック

| 項目 | 採用 |
|------|------|
| フロントエンド | React + TypeScript + Vite （SPA） |
| デザイン | New Brutalism（CSS variables） |
| ホスティング | GitHub Pages（静的ファイル） |
| パッケージ管理 | pnpm workspaces (monorepo) |
| ルーティング | Hash routing（GitHub Pages SPA対応） |
| Vite base | `/moji-code/`（リポジトリ名基準） |
| CLI | TypeScript + Node.js（shared を再利用） |
| CI/CD | GitHub Actions → `gh-pages` ブランチ |

## 環境

```
moji-code/
├── packages/
│   ├── web/          # React SPA → GitHub Pages デプロイ
│   ├── cli/          # npm パッケージ
│   └── shared/       # Unicode データ型・パーサ・エンコーディングUtils
├── scripts/
│   └── parse-ucd.ts  # UCD パーサ（ucd.json 生成）
├── .github/workflows/deploy.yml
├── package.json      # pnpm workspaces
├── PLAN.md           # 元の会話ログ
└── DEV-MEMO.md       # ← このファイル
```

## ファイル構成（主要）

```
packages/
├── shared/src/
│   ├── index.ts      # codepointToHex, utf8Bytes, utf16Units, escapeForms
│   ├── ucd.ts        # UcdRecord, UcdJson, lookupRecord, categoryLabel
│   ├── isEmoji.ts    # 絵文字範囲判定
│   ├── emoji.ts      # 絵文字分解（ZWJ, スキントーン, 国旗, キーキャップ）
│   └── normalize.ts  # NormalizationForms, normalizeAll, normalizationDiff
├── web/src/
│   ├── App.tsx       # ルーティング + 検索ページ
│   ├── main.tsx      # エントリポイント（HashRouter）
│   ├── index.css     # New Brutalism 全スタイル
│   ├── hooks/
│   │   └── useUcd.ts # ucd.json ロード + ルックアップ
│   └── components/
│       ├── CodePointCard.tsx  # 文字情報カード（UTF-8/16, エスケープ, 正規化）
│       ├── CodeTable.tsx      # ブロック別コード表 + ページング
│       ├── EmojiAnalyzer.tsx  # 絵文字分解ビュー
│       ├── FontSelector.tsx   # フォント切替（localStorage永続化）
│       └── ExportBar.tsx      # CSV/JSON エクスポート
├── cli/src/
│   └── index.ts      # CLI エントリ（文字解析, --json）
```

## マイルストーン

### Phase 0: プロジェクト初期化

- [x] `pnpm init` + `pnpm-workspace.yaml` 設定
- [x] `packages/shared/`, `packages/web/`, `packages/cli/` のディレクトリと `package.json` 作成
- [x] Vite + React + TypeScript セットアップ（`packages/web/`）
- [x] `vite.config.ts` に `base: "/moji-code/"` 設定
- [x] GitHub Actions デプロイワークフロー（`pnpm build` → `gh-pages`）
- [x] Hash routing 導入（`react-router-dom` → `HashRouter`）
- [x] 404.html（GitHub Pages SPA リダイレクト対策）

### Phase 1: Unicode データ（shared）

- [x] UCD（Unicode Character Database）の取得スクリプト（`scripts/parse-ucd.ts`）
- [x] UnicodeData.txt + Blocks.txt のパーサ（299,382 コードポイント）
- [x] `packages/shared/src/` に型定義（`UcdRecord`, `UcdJson` 等）
- [x] エンコーディングユーティリティ（UTF-8/UTF-16 バイト列計算、エスケープ表現）
- [x] `CodePoint → UCD 情報` を JSON に変換し `packages/web/public/ucd.json` に出力
- [x] ビルドスクリプト（`scripts/parse-ucd.ts` → `npx tsx scripts/parse-ucd.ts`）

### Phase 2: Web MVP（検索＋単一文字解析）

- [x] `App.tsx`（検索バー + 結果表示 + UCDルックアップ）
- [x] `CodePointCard.tsx`（文字・コードポイント・UTF-8/16・エスケープ・名前・カテゴリ・ブロック）
- [x] `src/index.css`（New Brutalism base style）
- [x] `/ucd.json` を fetch → 名前ルックアップ
- [x] U+XXXX 形式の入力検出とコードポイント直接表示

### Phase 3: コード表・フォント切替・デザイン

- [x] コード表ビュー（346 ブロック選択ドロップダウン + 256文字/ページ）
- [x] `FontSelector.tsx`（5種類のフォント切替 + localStorage 永続化）
- [x] New Brutalism CSS 完成（カード、グリッド、ボタン、テーブル）
- [x] 絵文字フォント例外処理（`isEmoji.ts` + CSS `.char.emoji`, `.table-cell.emoji`）

### Phase 4: 絵文字分解ビジュアライザー

- [x] 絵文字専用タブ追加（`/emoji` ルート）
- [x] `Intl.Segmenter` による grapheme cluster 分割
- [x] ZWJ シーケンス分解表示（ツリーUI：└─ インデント）
- [x] スキントーン（Fitzpatrick modifier, U+1F3FB-1F3FF）の検出と表示
- [x] 国旗（地域指標ペア, Regional Indicator Symbol Letter）の検出
- [x] キーキャップシーケンス（U+20E3）の検出
- [x] バリエーションセレクタ（VS16, VS15）の検出
- [x] 各構成要素のコードポイント + Unicode名表示
- [x] 絵文字範囲判定と役割ラベル表示

### Phase 5: Moji CLI

- [x] `packages/cli/` の `package.json`（`bin.moji` エントリ設定）
- [x] CLI エントリポイント（`src/index.ts` → `#!/usr/bin/env node`）
- [x] `packages/shared` を依存関係に追加
- [x] 引数パース（文字・U+XXXX 自動判別）
- [x] 複数文字の一括解析出力
- [x] `--json` フラグでJSON出力モード
- [x] ucd.json 自動ロード（dev: web/public, prod: package relative, fallback: cwd）

### Phase 6: 応用機能

- [x] 正規化比較（NFC / NFD / NFKC / NFKD → 差分のみ折りたたみ表示）
- [x] エクスポート（CSV / JSON ダウンロード）
- [x] 履歴（localStorage 直近20件、タグクリックで再検索）
- [x] 各情報のコピーボタン（UTF-8, UTF-16, JS escape, HTML entity）
- [x] README 作成（後日）

## CLI 使い方

```bash
# 文字解析
pnpm --filter @moji/cli start "あ"
node packages/cli/dist/index.js "Hello 世界"

# U+XXXX 形式
node packages/cli/dist/index.js U+1F600

# JSON 出力
node packages/cli/dist/index.js "あ" --json
```

## 開発サーバー起動

```bash
pnpm dev                    # 全パッケージ並列起動（webのみ有用）
pnpm --filter @moji/web dev # web のみ
open http://localhost:5173/moji-code/
```

## ビルド

```bash
pnpm build                  # 全パッケージビルド
pnpm --filter @moji/web build  # web のみ
```

## UCD データ更新

```bash
npx tsx scripts/parse-ucd.ts
```

## 参考リンク

- Unicode Character Database: https://www.unicode.org/ucd/
- GitHub Pages SPA: https://github.com/rafgraph/spa-github-pages
