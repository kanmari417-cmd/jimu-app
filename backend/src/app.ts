import cors from 'cors';
import express from 'express';
import { db } from './db/database.js';
import { paymentsRouter } from './routes/payments.js';
import { tasksRouter } from './routes/tasks.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // ヘルスチェック(DB接続確認込み)
  app.get('/api/health', (_req, res) => {
    const row = db.prepare('SELECT 1 AS ok').get();
    res.json({ status: 'ok', db: row ?? null, timestamp: new Date().toISOString() });
  });

  app.use('/api/payments', paymentsRouter);
  app.use('/api/tasks', tasksRouter);

  // 残りの機能のルーターはここに追加していく
  // app.use('/api/templates', templatesRouter);
  // app.use('/api/availability', availabilityRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
}
