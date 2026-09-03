import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: { default: 'מערכת ניהול', template: '%s | מערכת ניהול' },
  // מערכת הניהול לעולם לא נכנסת למנועי חיפוש.
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
