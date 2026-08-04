import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

/** Right-side drawer used for create/edit forms. */
export function Drawer({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col bg-white shadow-soft-lg focus:outline-none">
          <div className="flex items-center justify-between border-b border-ala-grey-200 px-6 py-4">
            <Dialog.Title className="font-heading text-lg font-semibold text-ala-navy">
              {title}
            </Dialog.Title>
            <Dialog.Close aria-label="Close" className="text-ala-grey-500 hover:text-ala-navy">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{title} form</Dialog.Description>
          <div className="flex-1 overflow-hidden">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
