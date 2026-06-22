import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-heading",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://liguelekie.cm'
const SITE_NAME = "Ligue Lékié"
const SITE_DESCRIPTION = "Site officiel de la ligue départementale de football d'Obala, Cameroun."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} — Football d'Obala`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['football', 'Obala', 'Lékié', 'Cameroun', 'championnat', 'ligue'],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Football d'Obala`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Football d'Obala`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${oswald.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground tracking-normal" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

