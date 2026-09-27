# GREEN-API Skill

Use this skill whenever working with GREEN-API requests, message receiving, chat identity,
message statuses, instance state, or API-related business rules.

## Instance state

The instance must be `authorized`.

The application checks this using `getStateInstance` during login/connection.

Do not assume an instance is usable merely because its credentials are present.

## Sending messages

Text messages are sent through `sendMessage`.

Keep the API request/response handling in the existing GREEN-API integration layer.

Do not expose raw API details throughout unrelated UI components.

## Receiving messages

The application uses HTTP polling:

```text
receiveNotification
        |
        v
process notification
        |
        v
deleteNotification
```

Webhook URL should be empty when browser polling is used. Otherwise the webhook can
consume notifications before the browser receives them.

Do not introduce a webhook backend for a frontend-only task.

## Notification deletion

Notifications are deleted using `deleteNotification` and their `receiptId`.

Process the notification before deleting it according to the existing implementation.

Do not delete arbitrary notifications without a corresponding receipt.

## Message deduplication

Incoming messages are deduplicated by `idMessage`.

Do not display the same incoming message twice when the API delivers a duplicate
notification.

Do not invent a second identity field for message deduplication.

## Outgoing status

Outgoing messages use this lifecycle:

```text
sending -> sent -> delivered -> read
```

The `sendMessage` response moves the message to `sent`.

Later delivery/read information is associated with `outgoingMessageStatus`.

Do not treat an API acknowledgement as proof that a message was read.

## Chat identity and normalization

A user-entered phone number is not necessarily the final chat identifier.

The expected flow is:

```text
phone number
    |
    v
checkAccount
    |
    v
normalized chatId
```

Use the resolved `chatId` for the actual chat identity.

Do not mix a phone number and its resolved `chatId` as if they were the same identifier.

Examples:

- Telegram can use a numeric chat ID such as `487637501`.
- WhatsApp can use an identifier such as `number@c.us`.

These formats must not be arbitrarily converted into each other.

## Free-tier correspondent quota

The free GREEN-API tariff has a limit of 3 unique correspondents per month plus a
monthly API-call quota.

A typo in a phone number can consume a correspondent slot permanently.

Deleting a chat does not reset the correspondent quota.

Therefore, before creating a chat from a phone number:

1. Validate/resolve the account using `checkAccount`.
2. Use the returned identity.
3. Only then create/use the chat.

## HTTP 466

Quota-related failures can return HTTP 466 with `correspondentsStatus` in the response.

Handle this as a quota/business error, not as a generic network failure.

Do not silently retry quota errors.

## Safety when changing API code

Before modifying GREEN-API behavior:

- inspect existing request helpers;
- inspect response types;
- inspect error handling;
- inspect message persistence;
- inspect polling lifecycle.

Prefer a minimal change over rewriting the integration layer.
