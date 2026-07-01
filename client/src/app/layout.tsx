import type { Metadata } from 'next';
import { Playfair_Display, Poppins } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-var',
  weight: ['400', '500', '600', '700'],
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins-var',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Beads & Beyond | Luxury Handcrafted Jewelry',
  description: 'Shop fine rings, earrings, bracelets, anklets, and necklaces crafted in solid champagne gold and diamond accents.',
  keywords: 'luxury jewelry, engagement rings, gold necklaces, swarovski crystal, fine diamond earrings, wedding bands',
  openGraph: {
    title: 'Beads & Beyond | Luxury Handcrafted Jewelry',
    description: 'Fine jewelry crafted for elegance and modern luxury.',
    type: 'website',
    url: 'https://beadsandbeyond.com',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <AppProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
