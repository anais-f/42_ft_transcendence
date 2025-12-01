Small server side notification system for friend events.

\`Message format\`:

- JSON object with:
  - \`type\`: string (e.g. \`friends:request\`, \`friends:accept\`, \`friends:reject\`)
  - \`data\`: object with:
    - \`from\`: { userId, username }
    - \`to\` (optional): { userId, username }
    - \`timestamp\`: ISO string
    - \`message\`: human message

\`How it works\`:

1. Server receives an action (ex: user A requests friendship with user B).
2. Server builds a notification payload and calls \`sendToUser(B, payload)\`.
3. If B is connected, client receives the payload in real time.

\`Example client handling\`:

- parse incoming JSON, switch on \`type\`, show UI notification, update local state.

\`Files\`:

- \`repo/services/social/app/usecases/notificationService.ts\` - helpers to build/send notifications
- \`repo/services/social/app/usecases/connectionManager.ts\` - holds \`sendToUser\` and connections
- \`repo/services/social/app/controllers/websocketControllers.ts\` - socket setup and message routing
