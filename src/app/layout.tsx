import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/components/AppProvider";
import { BottomNav } from "@/components/BottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { THEME_STORAGE_KEY } from "@/lib/themes";
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

const themeBootScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);document.documentElement.setAttribute("data-theme",t||"mets-classic");}catch(e){document.documentElement.setAttribute("data-theme","mets-classic");}})();`;

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
