import type { ReactNode } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { outlineButtonClass } from '@/lib/controls';

export const dangerButtonClass =
  'inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-white transition hover:bg-destructive-dark';

type Props = {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="flex gap-3">
          <button type="button" className={`${outlineButtonClass} flex-1`} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={`${dangerButtonClass} flex-1`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
