import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import * as RToast from '@radix-ui/react-toast';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type ToastKind = 'success' | 'error';
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastCtx = createContext<(kind: ToastKind, message: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = ++counter;
    setItems((prev) => [...prev, { id, kind, message }]);
  }, []);

  const remove = (id: number) => setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastCtx.Provider value={push}>
      <RToast.Provider swipeDirection="right">
        {children}
        {items.map((t) => (
          <RToast.Root
            key={t.id}
            duration={4000}
            onOpenChange={(open) => !open && remove(t.id)}
            className="flex items-center gap-3 rounded-card border border-ala-grey-200 bg-white px-4 py-3 shadow-soft-lg data-[state=open]:animate-fade-up"
          >
            {t.kind === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-ala-red" />
            )}
            <RToast.Description className="flex-1 text-sm text-ala-ink">
              {t.message}
            </RToast.Description>
            <RToast.Close aria-label="Close" className="text-ala-grey-500 hover:text-ala-navy">
              <X className="h-4 w-4" />
            </RToast.Close>
          </RToast.Root>
        ))}
        <RToast.Viewport className="fixed bottom-4 right-4 z-[100] flex w-80 max-w-[92vw] flex-col gap-2 outline-none" />
      </RToast.Provider>
    </ToastCtx.Provider>
  );
}
