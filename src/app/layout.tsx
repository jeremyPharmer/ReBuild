import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/components/AppProvider";
import { TopNav } from "@/components/TopNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { THEME_LAYOUT_BOOT, THEME_STORAGE_KEY } from "@/lib/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "JeremyOS",
  description:
    "Jeremy's executive assistant and personal operating system — daily rhythm, journal, and fund in one place.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e8eef8",
  viewportFit: "cover",
};

const themeBootScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var layouts=${JSON.stringify(THEME_LAYOUT_BOOT)};var t=localStorage.getItem(k)||"mets-classic";document.documentElement.setAttribute("data-theme",t);document.documentElement.setAttribute("data-layout",layouts[t]||"stadium");}catch(e){document.documentElement.setAttribute("data-theme","mets-classic");document.documentElement.setAttribute("data-layout","stadium");}})();`;

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
              <TopNav />
              {children}
            </div>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
