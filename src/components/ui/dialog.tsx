import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { X } from 'lucide-react';

import { cx } from '@/lib/cx';

type StringClassProps<Element extends React.ElementType> = Omit<
  React.ComponentProps<Element>,
  'className'
> & {
  className?: string;
};

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />;
}

function DialogContent({
  className,
  children,
  ...props
}: StringClassProps<typeof DialogPrimitive.Popup>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/45" />
      <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPrimitive.Popup
          className={cx(
            'modal-panel relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl outline-none',
            className,
          )}
          {...props}
        >
          <DialogPrimitive.Close
            aria-label="Закрыть"
            className="hover:bg-primary-lighter hover:text-primary-dark absolute top-4 right-4 rounded-md p-1 text-slate-400 transition"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cx('mb-5 flex flex-col gap-1', className)} {...props} />;
}

function DialogTitle({ className, ...props }: StringClassProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cx('text-lg font-semibold', className)} {...props} />;
}

function DialogDescription({
  className,
  ...props
}: StringClassProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description className={cx('text-sm text-slate-500', className)} {...props} />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
