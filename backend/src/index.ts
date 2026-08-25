import 'dotenv/config';
import { createApp } from './app.js';
import { initDatabase } from './db/database.js';

const PORT = Number(process.env.PORT ?? 4000);

initDatabase();

const app = createApp();

app.listen(PORT, () => {
  console.log(`[jimu-app backend] listening on http://localhost:${PORT}`);
});
