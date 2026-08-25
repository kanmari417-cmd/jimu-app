import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * 非同期ルートハンドラのエラーを Express のエラーハンドリングミドルウェアへ
 * 確実に転送するためのラッパー(Express 4はasync関数のrejectを自動catchしないため)。
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
