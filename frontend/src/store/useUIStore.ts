import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  modalData: any;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set: any) => ({
  sidebarOpen: true,
  activeModal: null,
  modalData: null,

  toggleSidebar: () => set((state: any) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  openModal: (modalId: string, data = null) => set({ activeModal: modalId, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}));

export default useUIStore;