import { Prompt, Kanit, Inter } from "next/font/google";
import { Providers } from "./Providers";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getSiteSettings } from "@/lib/data";
import MusicPlayer from "@/components/MusicPlayer";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || "Slumzick";
  const logo = settings?.logoUrl || "/favicon.ico";

  return {
    title: {
      default: `${siteName} • Official Syndicate Portal`,
      template: `%s | ${siteName}`,
    },
    description: settings?.description || "Official syndicate portal with elite roster and member directory",
    icons: {
      icon: [
        { url: logo, href: logo }
      ],
      shortcut: [logo],
      apple: [logo],
    },
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSiteSettings();
  const theme = settings?.theme || 'dark';
  const primaryColor = settings?.primaryColor || '#ff2a44';
  let textColor = settings?.textColor;
  if (!textColor || (theme === 'light' && (textColor.toLowerCase() === '#ffffff' || textColor.toLowerCase() === '#fff'))) {
    textColor = theme === 'light' ? '#0f172a' : '#ffffff';
  }
  const contrastColor = settings?.contrastColor || '#ffffff';
  const themeClass = theme === 'light' ? 'theme-light' : theme === 'contrast' ? 'theme-contrast' : 'theme-dark';

  return (
    <html lang="th" className={`${prompt.variable} ${kanit.variable} ${inter.variable} ${themeClass}`}>
      <head>
        {settings?.logoUrl && (
          <link rel="icon" href={settings.logoUrl} />
        )}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --theme-primary: ${primaryColor};
              --theme-text: ${textColor};
              --theme-contrast: ${contrastColor};
              --theme-color: ${primaryColor};
            }
          `
        }} />
      </head>
      <body className={`antialiased selection:bg-[#ff2a44] selection:text-white ${themeClass}`} style={{ color: textColor }}>
        <Providers>
          {children}
          {settings?.musicUrl && (
            <MusicPlayer 
              url={settings.musicUrl} 
              musicTitle={settings.musicTitle} 
              musicCover={settings.musicCover} 
            />
          )}
        </Providers>
      </body>
    </html>
  );
}
