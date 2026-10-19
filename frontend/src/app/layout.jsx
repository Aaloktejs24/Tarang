import "../styles/globals/index.css";
import 'katex/dist/katex.min.css';
import { AccessibilityProvider } from "../contexts/AccessibilityContext";
import { AuthProvider } from "../contexts/AuthContext";
import { ProfileProvider } from "../contexts/ProfileContext";
import { ToastProvider } from "../contexts/ToastContext";
import { ConfirmProvider } from "../contexts/ConfirmContext";
import AccessibilityMenu from "../components/navbar/AccessibilityMenu";
import LanguagePromptModal from "../components/navbar/LanguagePromptModal";
import GlobalBackground from "../components/common/GlobalBackground";
import NavigationProgress from "../components/common/NavigationProgress";

export const metadata = {
  title: "Tarang",
  description: "Tarang App",
};

import { Suspense } from "react";
import { LoadingProvider } from "../contexts/LoadingContext";
import Loader from "../components/common/Loader";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" type="image/png" href="/logo.svg" />
      </head>
      <body suppressHydrationWarning>
        <AppRouterCacheProvider>
          <AuthProvider>
            <ProfileProvider>
              <ToastProvider>
                <Suspense fallback={null}>
                  <LoadingProvider>
                    <AccessibilityProvider>
                      <ConfirmProvider>
                        <GlobalBackground />
                        <NavigationProgress />
                        <AccessibilityMenu />
                        <LanguagePromptModal />
                        {children}
                      </ConfirmProvider>
                    </AccessibilityProvider>
                  </LoadingProvider>
                </Suspense>
              </ToastProvider>
            </ProfileProvider>
          </AuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
