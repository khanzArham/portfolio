import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { defaultTitle } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

// Inter sets headings and body alike: one variable file covers every
// weight the site uses.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Mono is only for small metadata labels: not worth a preload that
// competes with the first paint on slow connections (Step 22).
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  preload: false,
});

// Set to "1" by Vercel during its builds (preview and production).
const isVercel = process.env.VERCEL === "1";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: defaultTitle, template: `%s · ${site.owner}` },
  description: site.positioning,
  authors: [{ name: site.owner, url: site.url }],
  openGraph: {
    siteName: site.owner,
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // next-themes sets the theme class on <html> before hydration.
    <html
      lang="en"
      suppressHydrationWarning
      // Smooth in-page scrolling (globals.css); Next.js keeps route changes
      // instant when it sees this attribute.
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        {/* Cookieless, no personal data (plan §7.4). Rendered only in Vercel
            builds: elsewhere the scripts 404 and add console errors. */}
        {isVercel && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
