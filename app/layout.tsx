import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jedavaliacao",
  description:
    "Oficinas mecânicas perdem tempo porque a gestão é ruim (check-in lento e serviço sem registro), o que causa falta de comunicação com o cliente.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body className="bg-canvas text-ink">
        <div className="flex min-h-screen flex-col md:flex-row">
          <Nav />
          <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-10">
            <div className="mx-auto w-full max-w-page">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
