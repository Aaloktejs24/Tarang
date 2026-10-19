import "../styles/globals.css";
import 'katex/dist/katex.min.css';
import { AccessibilityProvider } from "../contexts/AccessibilityContext";
import AccessibilityMenu from "../components/navbar/AccessibilityMenu";

import LanguagePromptModal from "../components/navbar/LanguagePromptModal";

export const metadata = {
  title: "Tarang",
  description: "Tarang App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" type="image/png" href="/logo.svg" />
      </head>
      <body suppressHydrationWarning>
        <AccessibilityProvider>
          <AccessibilityMenu />
          <LanguagePromptModal />
          {children}
        </AccessibilityProvider>
      </body>
    </html>
  );
}
