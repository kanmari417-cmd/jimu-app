import cors from 'cors';
import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { initDatabase, sql } from './db/postgres.js';
import { paymentsRouter } from './routes/payments.js';
import { tasksRouter } from './routes/tasks.js';
import { templatesRouter } from './routes/templates.js';
import { availabilityRouter } from './routes/availability.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // テーブル未作成なら作成する(初回のみ実行、以降はキャッシュされたPromiseを再利用)
  app.use((_req, res, next) => {
    initDatabase()
      .then(() => next())
      .catch((err) => {
        console.error('データベースの初期化に失敗しました', err);
        res.status(500).json({ error: 'データベースに接続できませんでした' });
      });
  });

  // ヘルスチェック(DB接続確認込み)
  app.get('/api/health', async (_req, res) => {
    try {
      const { rows } = await sql.query('SELECT 1 AS ok');
      res.json({ status: 'ok', db: rows[0] ?? null, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: 'error', error: 'データベース接続に失敗しました' });
    }
  });

  app.use('/api/payments', paymentsRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/templates', templatesRouter);
  app.use('/api/availability', availabilityRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  };
  app.use(errorHandler);

  return app;
}
