import { createContext } from "react";

export interface UIContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

export default UIContext;
