import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  onConfirm,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  busy?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-card bg-white p-6 shadow-soft-lg">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ala-red/10 text-ala-red">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <Dialog.Title className="font-heading text-lg font-semibold text-ala-navy">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-ala-grey-500">
                {message}
              </Dialog.Description>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="ghost" disabled={busy}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button variant="primary" onClick={onConfirm} disabled={busy}>
              {busy ? 'Deleting…' : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
