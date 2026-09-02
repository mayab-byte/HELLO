import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { dna } from '@/dna';
import { getSessionUser } from '@/lib/auth/session';
import LoginForm from './LoginForm';
import '../admin.css';

export const metadata: Metadata = { title: 'כניסה למערכת הניהול', robots: { index: false } };

export default async function LoginPage() {
  if (await getSessionUser()) redirect('/admin');

  return (
    <div className="adm adm-auth">
      <main className="adm-auth-card">
        <p className="adm-auth-brand">
          <span className="adm-auth-mark" aria-hidden="true">{dna.brand.logoMark}</span>
          {dna.brand.name}
        </p>
        <h1 className="adm-auth-title">כניסה למערכת הניהול</h1>
        <p className="adm-auth-lead">
          המערכת פתוחה למשתמשים שנוצרו על ידי מנהל האתר. אין הרשמה עצמית.
        </p>
        <LoginForm />
      </main>
    </div>
  );
}
