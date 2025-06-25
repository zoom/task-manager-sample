import { EnvVarWarning } from "@/components/layout/env-var-warning";
import HeaderAuth from "@/components/auth/header-auth";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";

import Sidebar from "@/components/sidebar";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" className="h-full" suppressHydrationWarning>

      <body suppressHydrationWarning className="h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
            
         
          {/* Outer container to make Sidebar and main content side-by-side */}
          <div className="flex h-full">

              {/* Sidebar on the left */}
           <Sidebar />

           

            {/* Main content on the right */}
            <main className="flex-1 flex flex-col">
              <div className="w-full flex flex-col gap-20 items-center">
                {/* Top Navigation */}
                <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                    <div className="flex gap-5 items-center font-semibold">
                      <Link href={"/"}>Zoom Task Manager</Link>
                    </div>
                    {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                  </div>
                </nav>

                {/* Page content */}
                <div className="flex-1 overflow-auto p-5 max-w-5xl mx-auto">
                {children}
                </div>

                {/* Footer */}
                <footer className="w-full flex items-center justify-center border-t text-xs gap-8 py-16">
                <p>
                    Powered by{" "}
                    <a
                      href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                      target="_blank"
                      className="font-bold hover:underline"
                      rel="noreferrer"
                    >
                      Supabase
                    </a>
                  </p>
                  <ThemeSwitcher />
                </footer>
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>

    </html>
  );
}
