import * as React from 'react';
import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { cx } from '@/lib/cx';

type StringClassProps<Element extends React.ElementType> = Omit<
  React.ComponentProps<Element>,
  'className'
> & {
  className?: string;
};

function Menu({ ...props }: React.ComponentProps<typeof MenuPrimitive.Root>) {
  return <MenuPrimitive.Root {...props} />;
}

function MenuTrigger({ ...props }: React.ComponentProps<typeof MenuPrimitive.Trigger>) {
  return <MenuPrimitive.Trigger {...props} />;
}

function MenuContent({
  className,
  children,
  ...props
}: StringClassProps<typeof MenuPrimitive.Popup>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner side="bottom" align="end" sideOffset={6}>
        <MenuPrimitive.Popup
          className={cx(
            'z-50 w-44 rounded-md border bg-white text-sm text-slate-900 shadow-lg outline-none',
            className,
          )}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function MenuItem({ className, ...props }: StringClassProps<typeof MenuPrimitive.Item>) {
  return (
    <MenuPrimitive.Item
      className={cx(
        'data-[highlighted]:bg-primary-light data-[highlighted]:text-primary-dark block w-full cursor-pointer px-3 py-2 text-left transition outline-none',
        className,
      )}
      {...props}
    />
  );
}

export { Menu, MenuContent, MenuItem, MenuTrigger };
