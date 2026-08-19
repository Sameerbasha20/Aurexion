import React from "react";
import ThemeProvider from "./providers/ThemeProvider";
import QueryProvider from "./providers/QueryProvider";
import AuthProvider from "./providers/AuthProvider";
import AppRouter from "./router";
import ErrorBoundary from "../components/common/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "../styles/variables.css";
import "../styles/typography.css";
import "../styles/animations.css";
import "../styles/responsive.css";
import "../styles/globals.css";

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable={false}>
        <QueryProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster theme="dark" />
              <AppRouter />
            </TooltipProvider>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
