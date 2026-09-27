# GREEN-API Chat

## Project

Minimalist browser-only chat client over GREEN-API for Telegram/WhatsApp/MAX instances.

The application sends text messages through `sendMessage` and receives messages through
`receiveNotification` / `deleteNotification`. There is no backend; all GREEN-API
interaction happens from the browser.

## Stack

- React 19
- TypeScript 7
- Vite 8
- Tailwind CSS 4 via `@tailwindcss/vite`
- `@base-ui/react` for Dialog/Menu primitives
- shadcn-style wrappers over Base UI in `src/components/ui/`
- `lucide-react` for icons
- JetBrains Mono as the primary font
- `react-router` 8 with `BrowserRouter`
- Prettier
- ESLint is intentionally not used

Tailwind 4 uses CSS-first configuration. There is no `tailwind.config.js`.

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm format
```

`pnpm build` runs `tsc -b && vite build`.

## General development rules

1. Read the existing implementation before changing architecture or introducing abstractions.
2. Prefer existing components, utilities, hooks, and patterns over creating duplicates.
3. Keep changes scoped to the requested task.
4. Do not add dependencies unless they are necessary and consistent with the project.
5. Do not replace established libraries with alternatives without an explicit reason.
6. Preserve existing behavior unless the task explicitly requires changing it.
7. Run the relevant formatter/build checks after significant changes.
8. Do not invent GREEN-API behavior. Check the GREEN-API skill and existing implementation first.
9. For UI work, follow `.agents/skills/ui/SKILL.md`.
10. For architecture/state/data-flow work, follow `.agents/skills/architecture/SKILL.md`.
11. For GREEN-API integration work, follow `.agents/skills/green-api/SKILL.md`.

## Architecture invariants

- There is no backend.
- Instance credentials, chats, and messages are stored in `localStorage`.
- The localStorage prefix is `green-api-chat:`.
- Clearing browser storage removes local application data.
- Incoming messages use HTTP polling.
- Webhook URL should remain empty when browser polling is used.
- `chatId` must be normalized and must not be mixed with a phone-number identifier.
- Outgoing message lifecycle is `sending` -> `sent` -> `delivered` / `read`.
- Incoming duplicates are filtered by `idMessage`.
- The sidebar uses a custom mouse resizer.
- Sidebar width is persisted in localStorage and constrained to 260–520px.
- `react-resizable-panels` is not used.

## Important UI constraints

- Theme tokens live in `src/index.css`.
- Theme colors use `oklch()`.
- Tailwind 4 mapping is done through `@theme inline`.
- Do not wrap existing `oklch()` tokens in `hsl()`.
- Primary accent is based on `#008235`.
- Use the existing destructive muted-red palette instead of Tailwind's default bright red.
- Use only the project's radius scale: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`.
- `rounded-full` is reserved for avatars and circular icon buttons.
- Use `lucide-react` for icons.
- Do not add inline SVG icons.
- Do not add a global `:focus-visible` outline.
- Follow the existing focus styles from `controls.ts`.
- Base UI state attributes should be preserved, including `data-[highlighted]`.

## Routing

`BrowserRouter` is used in `main.tsx`.

Because the application can be deployed to static hosting, routes must remain reachable
from `/` and the deployment must support SPA fallback behavior.

## Before finishing a task

- Check the diff for unrelated changes.
- Run `pnpm format` when formatting is affected.
- Run `pnpm build` when code changes could affect TypeScript or the production build.
- Make sure existing architecture invariants are still true.
