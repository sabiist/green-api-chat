# UI Skill

Use this skill whenever creating or modifying visual components, layouts, forms,
dialogs, menus, buttons, inputs, navigation, or styling.

## Component system

The project uses:

- `@base-ui/react` as the primitive library;
- shadcn-style wrappers in `src/components/ui/`;
- `lucide-react` for icons.

Do NOT introduce Radix UI.

Before creating a primitive, search `src/components/ui/` for an existing wrapper.

Prefer extending/reusing an existing component over creating a visually equivalent
duplicate.

## Icons

Use `lucide-react`.

Do not add inline SVG icons.

Do not introduce another icon library.

## Tailwind CSS

The project uses Tailwind CSS 4 through `@tailwindcss/vite`.

Configuration is CSS-first.

There is intentionally no `tailwind.config.js`.

Do not create one just to solve a styling task.

## Theme tokens

Theme tokens are defined in:

`src/index.css`

They use `oklch()`.

Tailwind 4 maps the tokens using `@theme inline`.

Do not wrap the existing `oklch()` values in `hsl()`.

Use existing theme tokens when possible instead of adding arbitrary colors.

## Colors

Primary accent:

- `#008235`
- dark: `#026630`
- bright: `#00a63e`

Light accent surfaces:

- `#e9f8f0`
- `#cfefdf`
- `#b7e8cd`

Destructive actions use a muted red:

- `#c43d3d`
- `#a83232`

Destructive surfaces:

- `#fbeaea`
- `#f3caca`

Do not use Tailwind's default bright red for destructive UI.

## Radius

Use only the project's radius scale:

- `rounded-sm`
- `rounded-md`
- `rounded-lg`
- `rounded-xl`

Base radius:

`--radius: 0.625rem`

Use `rounded-full` only for:

- avatars;
- circular icon buttons.

Do not use `rounded-full` as a generic card/button radius.

## Focus states

Do not add a global `:focus-visible` outline.

Use the existing focus treatment:

```text
focus:border-[#008235]
focus:ring-2
focus:ring-[#008235]/25
```

Follow the existing implementation in `controls.ts`.

Do not invent a second focus system.

## Base UI states

Base UI state attributes are intentional.

For highlighted menu items use the established pattern:

```text
data-[highlighted]:bg-[#cfefdf]
```

Do not replace Base UI state attributes with Radix-specific selectors.

## Visual consistency

Before adding new visual values:

1. Search existing components for the same pattern.
2. Reuse existing spacing, typography, colors, and radius.
3. Check `src/index.css`.
4. Check related components in `src/components/ui/`.

Avoid one-off visual decisions when an existing project convention exists.

## Responsive behavior

Preserve the current layout behavior.

Do not introduce a responsive framework or component library.

For layout changes, test narrow and wide viewport behavior when practical.

## UI implementation rule

When a task is small, prefer the smallest local change.

Do not redesign surrounding screens simply because you are already touching a component.
