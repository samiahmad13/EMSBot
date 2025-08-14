import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EMSBot",
  description: "Comprehensive ML tool aimed at aiding emergency medical providers in rapid and accurate diagnosis of conditions commonly encountered in the EMS setting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />
          <div className="absolute inset-0 opacity-40 [mask-image:radial-gradient(50%_50%_at_50%_0%,black,transparent_70%)]">
            <div className="mx-auto mt-[-10vh] h-[800px] w-[1200px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.25),transparent_60%)]" />
          </div>
          <div className="noise" />
        </div>
        {children}
      </body>
    </html>
  );
}
