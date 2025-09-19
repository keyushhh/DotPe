import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';

const router = Router();
const store = new Map<string, { code: string; expiresAt: number }>();

const reqPhone = z.object({
  phone: z.string().min(8, 'phone too short').max(15, 'phone too long'),
});

const reqVerify = z.object({
  phone: z.string().min(8).max(15),
  code: z.string().length(6),
});

router.post('/send', (req, res) => {
  const parsed = reqPhone.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid phone' });

  const { phone } = parsed.data;
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  const ttlMs = 2 * 60 * 1000; // 2 minutes
  store.set(phone, { code, expiresAt: Date.now() + ttlMs });

  // NOTE: In dev we return the code. In prod, integrate SMS and DO NOT return it.
  return res.json({
    ok: true,
    dev_code: code,
    expires_in_sec: ttlMs / 1000,
    message: 'OTP generated',
  });
});

router.post('/verify', (req, res) => {
  const parsed = reqVerify.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });

  const { phone, code } = parsed.data;
  const rec = store.get(phone);
  if (!rec) return res.status(400).json({ error: 'OTP not found' });
  if (Date.now() > rec.expiresAt) {
    store.delete(phone);
    return res.status(400).json({ error: 'OTP expired' });
  }
  if (rec.code !== code) return res.status(400).json({ error: 'Incorrect OTP' });

  store.delete(phone);
  const salt = process.env.OTP_SALT || 'change-me';
  const issuedAt = Date.now().toString();
  const token = crypto.createHmac('sha256', salt).update(`${phone}:${issuedAt}`).digest('hex');

  return res.json({ ok: true, token, issuedAt });
});

export default router;
