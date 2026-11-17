import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Comedero inteligente', description: 'Panel de control' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
