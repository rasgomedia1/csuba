import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import content from '../content.json';

type ToastKind = 'error' | 'info';
interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

const ToastContext = createContext<(message: string, kind?: ToastKind) => void>(() => {});

// Non-blocking notifications that replace window.alert().
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const show = useCallback((message: string, kind: ToastKind = 'error') => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => dismiss(id), 4000);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[min(92vw,420px)]" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded shadow-lg text-sm text-white ${
              t.kind === 'error' ? 'bg-red-600' : 'bg-brand-600'
            }`}
          >
            <span className="flex-1">{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} aria-label={content.common.close} className="font-bold">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
