# jimu-app

営業チーム・採用事務チーム向けの業務管理システム。以下4機能を1つのアプリにまとめています。

1. **着金入力管理** — 契約金額と着金金額の差異検知、未確認3日超過アラート、月別集計
2. **未提出チェック管理ボード** — カンバン形式のステータス管理、期限超過ハイライト
3. **定型メッセージ管理** — カテゴリ別テンプレート登録・ワンクリックコピー
4. **空き時間提案** — 複数人の予定から全員が空いている時間帯を自動計算

## 技術構成

- フロントエンド: React + TypeScript + Vite + Tailwind CSS
- バックエンド: Node.js + Express + TypeScript
- データベース: PostgreSQL([Neon](https://neon.com/) — Vercel Marketplace経由で接続、`@neondatabase/serverless` 使用)
- デプロイ: Vercel(フロントエンドは静的ホスティング、バックエンドは `api/index.ts` のサーバーレス関数として同一プロジェクトにデプロイ)
- データはユーザー単位ではなくチーム全体で1つのDBを共有

> 以前は「Vercel Postgres」というネイティブ製品を利用する想定でしたが、現在は廃止され
> Vercel Marketplace経由のNeon統合に置き換わっています。そのため本リポジトリは
> `@neondatabase/serverless`(NeonのHTTPベースドライバ)を直接利用しています。

## ディレクトリ構成

```
jimu-app/
├── api/        # Vercel Serverless Function のエントリポイント(backend/src/app.ts を再エクスポート)
├── backend/    # Express API 本体(ローカル開発用サーバーも含む)
├── frontend/   # React + Vite + Tailwind
└── vercel.json # Vercelのビルド/ルーティング設定
```

## セットアップ

初回のみ、ルートで依存関係をまとめてインストールします(npm workspaces)。

```bash
npm install
```

## データベース(Neon Postgres)の準備

ローカル開発・デプロイのいずれも、Neon(Postgres)の接続文字列が必要です。

1. Vercelプロジェクトの Storage タブから Marketplace 経由で **Neon** を追加(無料枠あり)
2. 接続後、Vercelプロジェクトに `DATABASE_URL`(推奨、`POSTGRES_URL` も後方互換として読み込みます)が自動的に環境変数として注入されます
3. ローカル開発でこの値を使う場合は `vercel env pull backend/.env` で取得するか、`backend/.env.example` を参考に `backend/.env` を手動作成してください

テーブルは初回リクエスト時に自動作成されます(`CREATE TABLE IF NOT EXISTS` のため、事前のマイグレーション作業は不要です)。

## 開発サーバーの起動

バックエンドとフロントエンドをそれぞれ別ターミナルで起動します(`backend/.env` に `DATABASE_URL` が必要です)。

```bash
# ターミナル1: バックエンド (http://localhost:4000)
npm run dev:backend

# ターミナル2: フロントエンド (http://localhost:5173)
npm run dev:frontend
```

フロントエンドの `/api/*` リクエストは Vite の proxy 設定により自動的にバックエンドへ転送されます。

## ビルド

```bash
npm run build          # backend(tsc) + frontend(vite build)
npm run typecheck:api  # api/index.ts の型チェック(backend/srcの型と合わせて確認)
```

## Vercelへのデプロイ

1. GitHubリポジトリをVercelプロジェクトに接続(このリポジトリ・ブランチを指定)
2. Storage タブから Neon(Postgres)を追加・接続し、`DATABASE_URL` を注入
3. デプロイを実行(`vercel.json` によりフロントエンドは `frontend/dist` を静的配信、`/api/*` へのリクエストは `api/index.ts` のサーバーレス関数(Expressアプリ)にルーティングされます)

## API疎通確認

バックエンド起動後、以下でヘルスチェックできます。

```bash
curl http://localhost:4000/api/health
```

フロントエンド画面右上の「API接続OK」表示でも確認できます(未接続時は「API接続エラー」)。

## レスポンシブ対応

- デスクトップ/タブレット(`sm`ブレークポイント以上): ヘッダー直下に横並びのタブナビゲーション
- スマートフォン: 画面下部に固定のアイコン付きボトムナビゲーション(iOSのアプリのような操作感)

## 現在の実装状況

- [x] プロジェクト雛形・ディレクトリ構成
- [x] ① 着金入力管理
- [x] ② 未提出チェック管理ボード
- [x] ③ 定型メッセージ管理
- [x] ④ 空き時間提案
- [x] 全体UI調整(共通ヘッダー/バナー/空状態コンポーネントへの統一、モバイル用ボトムナビゲーション追加)
- [x] PostgreSQL(Neon)への移行・Vercelデプロイ用構成
- [ ] Vercel本番デプロイ(Vercelトークン共有後に実施)
