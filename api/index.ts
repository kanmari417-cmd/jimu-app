// Vercel Serverless Function のエントリポイント。
// backend/src/app.ts の Express アプリをそのままエクスポートする。
// Express アプリは (req, res) => void として呼び出し可能なため、
// Vercel の Node.js ランタイムがそのままリクエストハンドラとして扱える。
import { createApp } from '../backend/src/app.js';

export default createApp();
