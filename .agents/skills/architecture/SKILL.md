# Architecture Skill

Use this skill whenever changing application structure, state management, persistence,
routing, data flow, or shared abstractions.

## Core architecture

This is a browser-only application. There is no application backend.

Persistent client data is stored in `localStorage` using the prefix:

`green-api-chat:`

Clearing browser storage is expected to remove local application data.

## State and data flow

Before introducing new state:

1. Search for existing state that represents the same concept.
2. Check whether the state already has a persistence mechanism.
3. Prefer extending the existing data flow over introducing a parallel store.
4. Keep API state, persisted state, and UI-only state conceptually separate.

Do not create duplicate sources of truth for chats, contacts, messages, or instance
credentials.

## GREEN-API data boundaries

Keep GREEN-API-specific request/response handling close to the integration layer.
UI components should not need to know raw GREEN-API transport details unless the existing
architecture already follows that pattern.

Normalize data at boundaries instead of spreading normalization logic through components.

## Chat identity

A phone number and a normalized `chatId` are different identifiers.

Do not use a raw phone number as a chat identity after the application has resolved the
actual `chatId`.

For Telegram, a chatId can be a numeric string. For WhatsApp it can have a form such
as `number@c.us`.

Do not merge different identifier formats into one generic string without preserving
their meaning.

## Message lifecycle

Outgoing messages have a lifecycle:

`sending -> sent -> delivered/read`

`sendMessage` acknowledgement is responsible for the transition to `sent`.
Delivery/read status comes from the corresponding GREEN-API event.

Incoming messages must be deduplicated by `idMessage`.

Do not add a second ad-hoc deduplication mechanism unless there is a demonstrated need.

## Polling

Incoming notifications use:

`receiveNotification -> process notification -> deleteNotification`

The notification should be deleted only after the application has successfully processed
the relevant notification according to the existing implementation.

Do not switch to webhooks or introduce a backend as part of a normal frontend task.

## Sidebar

The sidebar uses a custom mouse resizer.

- Minimum: 260px
- Maximum: 520px
- Width is persisted in localStorage.
- `react-resizable-panels` must not be introduced.

## Routing

The project uses `BrowserRouter`.

Do not replace it with another router unless explicitly requested.

For static hosting, routes need SPA fallback support. Do not solve routing issues by
adding unrelated routing libraries.

## Changing architecture

If a task appears to require a major architectural change:

1. Inspect the current implementation.
2. Identify the smallest compatible change.
3. Preserve existing public behavior.
4. Avoid speculative abstractions.
5. Explain architectural consequences in the final response.

Do not refactor unrelated code while implementing a feature.
