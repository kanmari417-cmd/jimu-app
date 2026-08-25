# jimu-app

営業チーム・採用事務チーム向けの業務管理システム。以下4機能を1つのアプリにまとめています。

1. **着金入力管理** — 契約金額と着金金額の差異検知、未確認3日超過アラート、月別集計
2. **未提出チェック管理ボード** — カンバン形式のステータス管理、期限超過ハイライト
3. **定型メッセージ管理** — カテゴリ別テンプレート登録・ワンクリックコピー
4. **空き時間提案** — 複数人の予定から全員が空いている時間帯を自動計算

## 技術構成

- フロントエンド: React + TypeScript + Vite + Tailwind CSS
- バックエンド: Node.js + Express + TypeScript + SQLite (better-sqlite3)
- データはユーザー単位ではなくチーム全体で1つのDBを共有

## ディレクトリ構成

```
jimu-app/
├── backend/    # Express API + SQLite
└── frontend/   # React + Vite + Tailwind
```

詳細は各ディレクトリを参照してください。

## セットアップ

初回のみ、ルートで依存関係をまとめてインストールします(npm workspaces)。

```bash
npm install
```

## 開発サーバーの起動

バックエンドとフロントエンドをそれぞれ別ターミナルで起動します。

```bash
# ターミナル1: バックエンド (http://localhost:4000)
npm run dev:backend

# ターミナル2: フロントエンド (http://localhost:5173)
npm run dev:frontend
```

フロントエンドの `/api/*` リクエストは Vite の proxy 設定により自動的にバックエンドへ転送されます。

初回起動時、`backend/data/jimu-app.sqlite` が自動生成され、`backend/src/db/schema.sql` の定義でテーブルが作成されます。

## ビルド

```bash
npm run build
```

## 現在の実装状況

- [x] プロジェクト雛形・ディレクトリ構成
- [x] ① 着金入力管理
- [ ] ② 未提出チェック管理ボード
- [ ] ③ 定型メッセージ管理
- [ ] ④ 空き時間提案
- [ ] 全体UI調整
