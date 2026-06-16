import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pelatih Membaca Cepat",
  description: "Tingkatkan kecepatan membaca Anda menggunakan teknik ORP",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Speed Reading Trainer",
  },
};

export const viewport = {
  themeColor: "#f59e0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    // Force unregister service workers in development to prevent infinite refresh loops
                    navigator.serviceWorker.getRegistrations().then(function(registrations) {
                      for(let registration of registrations) {
                        registration.unregister();
                        console.log('ServiceWorker unregistered in development');
                      }
                    });
                    // Clear caches to escape the loop
                    if ('caches' in window) {
                      caches.keys().then(function(names) {
                        for (let name of names) caches.delete(name);
                      });
                    }
                  } else {
                    navigator.serviceWorker.register('/sw.js').then(function(registration) {
                      console.log('ServiceWorker registration successful');
                    }).catch(function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                  }
                });
              }

              // Theme Initialization Script
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  var isDark = true; // Default is dark
                  if (savedTheme === 'light') {
                    isDark = false;
                  }
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full font-sans selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-amber-100 text-foreground overflow-x-hidden transition-colors duration-300">
        {children}
        <SpeedInsights />
        <Analytics />
        <Script src="https://tally.so/widgets/embed.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
