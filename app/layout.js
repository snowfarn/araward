import { Anuphan, Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { Providers } from "./Providers";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getSiteSettings } from "@/lib/data";
import MusicPlayer from "@/components/MusicPlayer";
import DynamicFavicon from "@/components/DynamicFavicon";
import "./globals.css";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName || "Slumzick";
  const logo = settings?.logoUrl || "/default-favicon.ico";
  const bgImg = settings?.backgroundUrl || "/banner.png";

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: settings?.description || `Official ${siteName} Syndicate Portal`,
    icons: {
      icon: [
        { url: logo, href: logo },
        { url: '/favicon.ico', href: '/favicon.ico' }
      ],
      shortcut: [logo],
      apple: [logo],
    },
    openGraph: {
      title: siteName,
      description: settings?.description || `Official ${siteName} Syndicate Portal`,
      images: [
        {
          url: bgImg,
          width: 1200,
          height: 630,
          alt: siteName,
        }
      ],
      type: 'website',
      siteName: siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: settings?.description || `Official ${siteName} Syndicate Portal`,
      images: [bgImg],
    },
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSiteSettings();
  const theme = settings?.theme || 'dark';
  const primaryColor = settings?.primaryColor || '#ff2a44';
  const logo = settings?.logoUrl || '/default-favicon.ico';
  let textColor = settings?.textColor;
  if (!textColor || (theme === 'light' && (textColor.toLowerCase() === '#ffffff' || textColor.toLowerCase() === '#fff'))) {
    textColor = theme === 'light' ? '#0f172a' : '#ffffff';
  }
  const contrastColor = settings?.contrastColor || '#ffffff';
  const themeClass = theme === 'light' ? 'theme-light' : theme === 'contrast' ? 'theme-contrast' : 'theme-dark';

  return (
    <html lang="th" className={`${anuphan.variable} ${plusJakartaSans.variable} ${outfit.variable} ${themeClass}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href={logo} />
        <link rel="shortcut icon" href={logo} />
        <link rel="apple-touch-icon" href={logo} />
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
          <DynamicFavicon logoUrl={logo} />
          {children}
          {settings?.musicUrl && (
            <MusicPlayer 
              url={settings.musicUrl} 
              musicTitle={settings.musicTitle} 
              musicCover={settings.musicCover} 
              musicStartTime={settings?.musicStartTime || 0}
              initialVolume={settings?.musicVolume !== undefined ? settings.musicVolume : 30}
            />
          )}
        </Providers>
      </body>
    </html>
  );
}
