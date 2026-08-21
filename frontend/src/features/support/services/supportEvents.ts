type SupportDataListener = () => void;

const listeners = new Set<SupportDataListener>();

export function notifySupportDataChanged(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeSupportDataChanged(listener: SupportDataListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}