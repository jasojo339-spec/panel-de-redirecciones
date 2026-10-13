import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Panel de Redirecciones",
  description: "Panel con redirecciones a diferentes páginas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="border-b border-slate-800 px-5 py-3 flex items-center justify-between text-sm">
          <Link href="/" className="font-semibold text-slate-100">
            🔀 Panel
          </Link>
          <div className="flex gap-4 text-slate-400">
            <Link href="/" className="hover:text-sky-400 transition-colors">
              Destinos
            </Link>
            <Link href="/admin" className="hover:text-sky-400 transition-colors">
              Admin
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
