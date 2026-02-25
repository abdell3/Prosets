import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { RoleNav } from "@/components/role-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prosets Marketplace",
  description: "MVP marketplace assets numériques",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const devBypass = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";
  const auth0Configured = Boolean(
    process.env.AUTH0_DOMAIN &&
      process.env.AUTH0_CLIENT_ID &&
      process.env.AUTH0_CLIENT_SECRET &&
      process.env.AUTH0_ISSUER_BASE_URL &&
      process.env.AUTH0_SECRET,
  );

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-zinc-50">
          <header className="border-b bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-4">
                <Link href="/catalogue" className="font-semibold">
                  Prosets
                </Link>
                <RoleNav />
              </div>
              <div className="flex items-center gap-2">
                {devBypass ? (
                  <>
                    <a href="/login" className="text-sm underline">
                      Login
                    </a>
                    <a href="/logout" className="text-sm underline">
                      Logout
                    </a>
                  </>
                ) : auth0Configured ? (
                  <>
                    <a href="/auth/login" className="text-sm underline">
                      Login
                    </a>
                    <a href="/auth/logout" className="text-sm underline">
                      Logout
                    </a>
                  </>
                ) : (
                  <span className="text-xs text-zinc-500">Auth not configured</span>
                )}
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
