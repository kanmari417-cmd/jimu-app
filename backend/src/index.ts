import 'dotenv/config';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT ?? 4000);

if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
  console.warn(
    '[jimu-app backend] 警告: DATABASE_URL (または POSTGRES_URL) が設定されていません。backend/.env を確認してください。',
  );
}

const app = createApp();

app.listen(PORT, () => {
  console.log(`[jimu-app backend] listening on http://localhost:${PORT}`);
});
