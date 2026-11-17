import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: 'Regency Assets Management Limited — Stockbroking Mandate Portal',
  description: 'NGX & NASD Sales and Purchase Mandate Form with Automated Charges & Admin Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={jakarta.className}>
      <body className="antialiased tabular-nums">{children}</body>
    </html>
  );
}
