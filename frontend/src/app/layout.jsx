import "../styles/globals.css";
import 'katex/dist/katex.min.css';
import { AccessibilityProvider } from "../contexts/AccessibilityContext";
import { AuthProvider } from "../contexts/AuthContext";
import AccessibilityMenu from "../components/navbar/AccessibilityMenu";
import LanguagePromptModal from "../components/navbar/LanguagePromptModal";
import GlobalBackground from "../components/common/GlobalBackground";

export const metadata = {
  title: "Tarang",
  description: "Tarang App",
};

import { Suspense } from "react";
import { LoadingProvider } from "../contexts/LoadingContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" type="image/png" href="/logo.svg" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <Suspense fallback={null}>
            <LoadingProvider>
              <AccessibilityProvider>
                <GlobalBackground />
                <AccessibilityMenu />
                <LanguagePromptModal />
                {children}
              </AccessibilityProvider>
            </LoadingProvider>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
