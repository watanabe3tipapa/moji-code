# moji-code

文字コード超人（試作品）

## 概要

moji-code は TypeScript を用いたモノレポ構成のプロジェクトです。リポジトリの説明では「文字コード超人（試作品）」とあり、実験的・試作的な段階にあることが明示されています。

ホームページ: https://watanabe3tipapa.github.io/moji-code/

## 主な内容

- TypeScript ベースのパッケージ群を含む monorepo 構成（packages ディレクトリ）。
- 開発メモ（DEV-MEMO.md）やビルド/スクリプト設定（package.json, tsconfig.json など）を含む構成。

## 開発・利用に関する確認できる情報

- Node エンジン要件: >= 18（package.json の engines に記載）。
- パッケージ管理/ワークスペース: pnpm ワークスペースを想定するファイルが含まれています（pnpm-workspace.yaml, pnpm-lock.yaml）。
- package.json に定義されているスクリプト（リポジトリのルート package.json に基づく）:

  - dev: "pnpm -r --parallel dev"
  - build: "pnpm -r build"
  - lint: "pnpm -r lint"
  - typecheck: "pnpm -r typecheck"

- devDependencies に `tsx` が含まれています（バージョン ^4.22.4）。

注: 上記はリポジトリ内の設定ファイルに記載されている内容を列挙したものです。具体的な実行手順や環境構築手順はリポジトリ内に明記されていないため、ここでは推測を含めて記載していません。

## リポジトリ構成（ルートにある主なファイル・ディレクトリ）

- .github/
- .gitignore
- DEV-MEMO.md
- package.json
- packages/
- pnpm-lock.yaml
- pnpm-workspace.yaml
- scripts/
- tsconfig.json

## 開発・保守状態

- リポジトリ説明は「試作品」としているため、開発中または実験的な段階であることが明示されています。
- リポジトリはアーカイブされていません（archived: false）。

## 関連資料

- プロジェクトサイト: https://watanabe3tipapa.github.io/moji-code/
- 開発メモ: DEV-MEMO.md（リポジトリ内）

## ライセンス

- リポジトリ内にライセンス表記は確認できませんでした。ライセンス情報が必要な場合はリポジトリのソースを参照してください。

## 貢献・連絡

- 貢献方法やコントリビュートに関する記載はリポジトリ内で確認できませんでした。貢献や問い合わせの手順が必要な場合は、リポジトリの公開ページや作成者の指定する窓口を確認してください。
