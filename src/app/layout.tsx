import './globals.css';
import ThemeProvider from './components/ThemeProviderClient';
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata = {
  title: 'CWA Assignment - Tabs Generator',
  description: 'Assignment 1 - Next.js App Router TypeScript',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Header />
          <main className="container">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
