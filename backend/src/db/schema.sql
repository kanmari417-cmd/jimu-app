-- jimu-app データベーススキーマ
-- チーム全体で1つのSQLiteファイルを共有する(ユーザー単位の分離なし)

-- ① 着金入力管理
CREATE TABLE IF NOT EXISTS payments (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  date              TEXT NOT NULL,                 -- 日付 (YYYY-MM-DD)
  customer_name     TEXT NOT NULL,                 -- 顧客名
  staff_name        TEXT NOT NULL,                 -- 担当者名
  contract_amount   INTEGER NOT NULL,               -- 契約金額
  confirmed_date    TEXT,                            -- 着金確認日 (YYYY-MM-DD)
  received_amount   INTEGER,                         -- 着金金額
  status            TEXT NOT NULL DEFAULT '未確認' CHECK (status IN ('未確認', '確認済み', '要対応')),
  notes             TEXT,                            -- 備考
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ② 未提出チェック管理ボード
CREATE TABLE IF NOT EXISTS tasks (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  target_name   TEXT NOT NULL,                     -- 対象者名
  type          TEXT NOT NULL,                     -- 種別
  staff_name    TEXT NOT NULL,                     -- 担当者
  due_date      TEXT NOT NULL,                     -- 期限 (YYYY-MM-DD)
  status        TEXT NOT NULL DEFAULT '提出待ち' CHECK (status IN ('提出待ち', '確認中', '完了')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ③ 定型メッセージ管理
CREATE TABLE IF NOT EXISTS message_templates (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  category      TEXT NOT NULL CHECK (category IN ('採用事務', 'Slack投稿', '顧客対応')),
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ④ 空き時間提案(入力した予定セットを保存)
CREATE TABLE IF NOT EXISTS availability_sets (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS availability_slots (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  set_id        INTEGER NOT NULL REFERENCES availability_sets(id) ON DELETE CASCADE,
  member_name   TEXT NOT NULL,
  start_time    TEXT NOT NULL,                     -- ISO datetime
  end_time      TEXT NOT NULL                      -- ISO datetime
);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_templates_category ON message_templates(category);
CREATE INDEX IF NOT EXISTS idx_availability_slots_set_id ON availability_slots(set_id);
