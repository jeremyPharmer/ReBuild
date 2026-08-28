import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/components/AppProvider";
import { BottomNav } from "@/components/BottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { THEME_STORAGE_KEY } from "@/lib/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "REBUILD",
  description:
    "You're not starting over. You're building from here — a daily recovery companion with a financial operating system.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f1c18",
  viewportFit: "cover",
};

const themeBootScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t)document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <ThemeProvider>
          <AppProvider>
            <div className="app-shell">
              {children}
              <BottomNav />
            </div>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
