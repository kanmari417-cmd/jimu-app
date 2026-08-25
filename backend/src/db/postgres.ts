import { neon } from '@neondatabase/serverless';

// Vercel Postgres(ネイティブ製品)は廃止され、Vercel Marketplace経由の
// Neon統合に置き換わっている。接続文字列は DATABASE_URL(推奨)または
// 後方互換の POSTGRES_URL として注入される。
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL (または POSTGRES_URL) が設定されていません。' +
      'Vercelプロジェクトに Neon (Postgres) を接続するか、ローカル開発では backend/.env に設定してください。',
  );
}

// fullResults: true を指定し、node-postgres 互換の
// { rows, rowCount, command, fields, ... } 形式で結果を受け取る。
const neonSql = neon(connectionString, { fullResults: true });

interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

// @neondatabase/serverless の neon() が返す関数はタグ付きテンプレートとしても
// 通常の関数としても呼び出せる。ここでは (text, params) 形式に統一し、
// 呼び出し側で行の型を指定できるようにする薄いラッパー。
export const sql = {
  query: <T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<QueryResult<T>> =>
    neonSql(text, params) as unknown as Promise<QueryResult<T>>,
};

// チーム全体で共有する3機能分のテーブル定義。
// (空き時間提案は永続化不要のため対象外)
const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS payments (
    id                SERIAL PRIMARY KEY,
    date              TEXT NOT NULL,
    customer_name     TEXT NOT NULL,
    staff_name        TEXT NOT NULL,
    contract_amount   INTEGER NOT NULL,
    confirmed_date    TEXT,
    received_amount   INTEGER,
    status            TEXT NOT NULL DEFAULT '未確認' CHECK (status IN ('未確認', '確認済み', '要対応')),
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id            SERIAL PRIMARY KEY,
    target_name   TEXT NOT NULL,
    type          TEXT NOT NULL,
    staff_name    TEXT NOT NULL,
    due_date      TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT '提出待ち' CHECK (status IN ('提出待ち', '確認中', '完了')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS message_templates (
    id            SERIAL PRIMARY KEY,
    category      TEXT NOT NULL CHECK (category IN ('採用事務', 'Slack投稿', '顧客対応')),
    title         TEXT NOT NULL,
    body          TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)`,
  `CREATE INDEX IF NOT EXISTS idx_templates_category ON message_templates(category)`,
];

let initPromise: Promise<void> | null = null;

/**
 * テーブルが未作成なら作成する(CREATE TABLE/INDEX IF NOT EXISTSなので何度呼んでも安全)。
 * サーバーレス関数のウォームスタート中は Promise をキャッシュし、リクエストのたびに
 * スキーマ確認クエリを発行しないようにする。失敗時は次回呼び出しでリトライする。
 */
export function initDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      for (const statement of SCHEMA_STATEMENTS) {
        await sql.query(statement);
      }
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}
