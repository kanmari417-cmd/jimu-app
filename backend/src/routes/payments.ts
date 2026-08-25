import { Router } from 'express';
import * as PaymentsService from '../services/payments.js';
import type { PaymentInput, PaymentStatus } from '../types/payment.js';

const STATUSES: PaymentStatus[] = ['未確認', '確認済み', '要対応'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parsePaymentInput(
  body: unknown,
  { partial }: { partial: boolean },
): { data?: Partial<PaymentInput>; error?: string } {
  if (typeof body !== 'object' || body === null) {
    return { error: 'リクエストボディが不正です' };
  }
  const b = body as Record<string, unknown>;
  const data: Partial<PaymentInput> = {};

  if (!partial || b.date !== undefined) {
    if (typeof b.date !== 'string' || !DATE_RE.test(b.date)) {
      return { error: '日付(date)はYYYY-MM-DD形式で指定してください' };
    }
    data.date = b.date;
  }
  if (!partial || b.customer_name !== undefined) {
    if (typeof b.customer_name !== 'string' || !b.customer_name.trim()) {
      return { error: '顧客名(customer_name)は必須です' };
    }
    data.customer_name = b.customer_name.trim();
  }
  if (!partial || b.staff_name !== undefined) {
    if (typeof b.staff_name !== 'string' || !b.staff_name.trim()) {
      return { error: '担当者名(staff_name)は必須です' };
    }
    data.staff_name = b.staff_name.trim();
  }
  if (!partial || b.contract_amount !== undefined) {
    if (typeof b.contract_amount !== 'number' || Number.isNaN(b.contract_amount) || b.contract_amount < 0) {
      return { error: '契約金額(contract_amount)は0以上の数値で指定してください' };
    }
    data.contract_amount = b.contract_amount;
  }
  if (b.confirmed_date !== undefined) {
    if (b.confirmed_date !== null && (typeof b.confirmed_date !== 'string' || !DATE_RE.test(b.confirmed_date))) {
      return { error: '着金確認日(confirmed_date)はYYYY-MM-DD形式で指定してください' };
    }
    data.confirmed_date = b.confirmed_date as string | null;
  }
  if (b.received_amount !== undefined) {
    if (
      b.received_amount !== null &&
      (typeof b.received_amount !== 'number' || Number.isNaN(b.received_amount) || b.received_amount < 0)
    ) {
      return { error: '着金金額(received_amount)は0以上の数値で指定してください' };
    }
    data.received_amount = b.received_amount as number | null;
  }
  if (b.status !== undefined) {
    if (typeof b.status !== 'string' || !STATUSES.includes(b.status as PaymentStatus)) {
      return { error: `ステータス(status)は ${STATUSES.join('/')} のいずれかを指定してください` };
    }
    data.status = b.status as PaymentStatus;
  }
  if (b.notes !== undefined) {
    data.notes = b.notes === null ? null : String(b.notes);
  }

  return { data };
}

export const paymentsRouter = Router();

paymentsRouter.get('/', (req, res) => {
  const { status, month } = req.query;
  const payments = PaymentsService.listPayments({
    status: typeof status === 'string' ? status : undefined,
    month: typeof month === 'string' ? month : undefined,
  });
  res.json(payments);
});

// ":id" より先に定義しないと "/summary/monthly" が :id にマッチしてしまう
paymentsRouter.get('/summary/monthly', (_req, res) => {
  res.json(PaymentsService.monthlySummary());
});

paymentsRouter.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const payment = PaymentsService.getPayment(id);
  if (!payment) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }
  res.json(payment);
});

paymentsRouter.post('/', (req, res) => {
  const { data, error } = parsePaymentInput(req.body, { partial: false });
  if (error || !data) {
    res.status(400).json({ error });
    return;
  }
  const created = PaymentsService.createPayment(data as PaymentInput);
  res.status(201).json(created);
});

paymentsRouter.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { data, error } = parsePaymentInput(req.body, { partial: true });
  if (error || !data) {
    res.status(400).json({ error });
    return;
  }
  const updated = PaymentsService.updatePayment(id, data);
  if (!updated) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }
  res.json(updated);
});

paymentsRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const success = PaymentsService.deletePayment(id);
  if (!success) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }
  res.status(204).send();
});
