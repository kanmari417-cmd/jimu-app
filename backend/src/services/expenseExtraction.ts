import Anthropic from '@anthropic-ai/sdk';
import dayjs from 'dayjs';
import type { ExpenseCategory, ExtractedReceipt } from '../types/expense.js';

const CATEGORIES: ExpenseCategory[] = ['交通費', '接待交際費', '消耗品費', '会議費', 'その他'];

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        'ANTHROPIC_API_KEY が設定されていません。領収書の自動読み取りにはAnthropic APIキーが必要です。',
      );
    }
    client = new Anthropic();
  }
  return client;
}

const SUPPORTED_MEDIA_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const;
type SupportedMediaType = (typeof SUPPORTED_MEDIA_TYPES)[number];

function parseDataUrl(dataUrl: string): { mediaType: SupportedMediaType; base64: string } {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) {
    throw new Error('画像データの形式が不正です');
  }
  const rawMediaType = match[1] === 'image/jpg' ? 'image/jpeg' : match[1];
  if (!SUPPORTED_MEDIA_TYPES.includes(rawMediaType as SupportedMediaType)) {
    throw new Error('対応していない画像形式です(png/jpeg/webp/gifのみ対応)');
  }
  return { mediaType: rawMediaType as SupportedMediaType, base64: match[2] };
}

/**
 * 領収書(手書き含む)の画像から日付・支払先・金額・カテゴリを読み取る。
 * strict なツール呼び出しで構造化データを取得し、読み取れない項目は
 * 空文字列/0で返す(呼び出し側でnullに変換して「未入力」として扱う)。
 */
export async function extractReceipt(imageDataUrl: string): Promise<ExtractedReceipt> {
  const anthropic = getClient();
  const { mediaType, base64 } = parseDataUrl(imageDataUrl);
  const today = dayjs().format('YYYY-MM-DD');

  const response = await anthropic.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 1024,
    tools: [
      {
        name: 'extract_receipt',
        description: '領収書の画像から読み取った内容を構造化して返す',
        strict: true,
        input_schema: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              description:
                '領収書に記載された日付をYYYY-MM-DD形式で。年が書かれていない場合は文脈から推定(不明なら今日の日付を使う)。全く読み取れない場合は空文字列。',
            },
            vendor: {
              type: 'string',
              description: '支払先(店舗名・会社名)。読み取れない場合は空文字列。',
            },
            amount: {
              type: 'number',
              description: '合計金額(税込・円)。数値のみ。読み取れない場合は0。',
            },
            category: {
              type: 'string',
              enum: CATEGORIES,
              description: '内容から最も近いと思われる経費カテゴリを1つ選ぶ。',
            },
            notes: {
              type: 'string',
              description: '手書きで判読しづらかった点や、自信が無い項目があれば短く補足。無ければ空文字列。',
            },
          },
          required: ['date', 'vendor', 'amount', 'category', 'notes'],
          additionalProperties: false,
        },
      },
    ],
    tool_choice: { type: 'auto' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          {
            type: 'text',
            text:
              `今日の日付は ${today} です。添付は経費精算用の領収書の写真です(印刷・手書きどちらの場合もあります)。` +
              'extract_receipt ツールを使って、日付・支払先・金額・カテゴリを読み取ってください。' +
              '手書きで判読しづらい場合もベストエフォートで埋め、不確かな点は notes に書いてください。',
          },
        ],
      },
    ],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.Beta.BetaToolUseBlock => block.type === 'tool_use' && block.name === 'extract_receipt',
  );

  if (!toolUse) {
    return {
      date: null,
      vendor: null,
      amount: null,
      category: null,
      notes: '自動読み取りに失敗しました。内容を手動で入力してください。',
    };
  }

  const input = toolUse.input as {
    date?: unknown;
    vendor?: unknown;
    amount?: unknown;
    category?: unknown;
    notes?: unknown;
  };

  return {
    date: typeof input.date === 'string' && input.date.trim() ? input.date : null,
    vendor: typeof input.vendor === 'string' && input.vendor.trim() ? input.vendor : null,
    amount: typeof input.amount === 'number' && input.amount > 0 ? input.amount : null,
    category:
      typeof input.category === 'string' && (CATEGORIES as string[]).includes(input.category)
        ? (input.category as ExpenseCategory)
        : null,
    notes: typeof input.notes === 'string' && input.notes.trim() ? input.notes : null,
  };
}
