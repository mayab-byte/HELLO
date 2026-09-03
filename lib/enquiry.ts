'use server';

import { headers } from 'next/headers';
import { db } from '@/lib/db';

export interface EnquiryState {
  ok?: boolean;
  error?: string;
  fields?: Partial<Record<'name' | 'phone' | 'email' | 'message', string>>;
}

/** חלון של 15 דקות ו-5 פניות לכתובת IP, כדי לחסום הצפה של הטופס. */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;

export async function submitEnquiry(_p: EnquiryState, fd: FormData): Promise<EnquiryState> {
  // honeypot: שדה מוסתר שרק בוט ימלא. אין CAPTCHA ואין חיכוך למשתמש אמיתי.
  if (String(fd.get('website') ?? '')) return { ok: true };

  const name = String(fd.get('name') ?? '').trim();
  const phone = String(fd.get('phone') ?? '').trim();
  const email = String(fd.get('email') ?? '').trim();
  const message = String(fd.get('message') ?? '').trim();

  const fields: EnquiryState['fields'] = {};
  if (name.length < 2) fields.name = 'יש להזין שם מלא (לפחות 2 תווים).';
  if (!/^0\d{1,2}-?\d{7}$/.test(phone.replace(/\s/g, ''))) {
    fields.phone = 'יש להזין מספר טלפון ישראלי תקין, לדוגמה 050-0000000.';
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    fields.email = 'כתובת האימייל אינה תקינה.';
  }
  if (message.length < 10) fields.message = 'יש לכתוב הודעה באורך 10 תווים לפחות.';

  if (Object.keys(fields).length) return { fields };

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  if (ip) {
    const recent = await db.enquiry.count({
      where: { ip, createdAt: { gt: new Date(Date.now() - WINDOW_MS) } },
    });
    if (recent >= MAX_PER_WINDOW) {
      return { error: 'התקבלו מכם מספר פניות. נסו שוב בעוד כמה דקות.' };
    }
  }

  await db.enquiry.create({ data: { name, phone, email: email || null, message, ip } });
  return { ok: true };
}
