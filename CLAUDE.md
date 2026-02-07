# Environment
This project is inside a `devbox` environment.
So any tool that you need to install you MUST use the command:
`devbox add <tool>`

Example:
`devbox add jq`

> DO NOT install any tool using any other command!


# Goal
- Name of the app: solo
- Develop a Web App that is compatible with PWA (Progressive Web App)
- MUST run in iOS as well as on a Desktop browser
- App is a simple chat app, similar to Signal. Minimalistic
- App MUST be local-first with CRDT (Conflict free Replicated Data Type), with auto multi-device sync
- App MUST have E2EE with a 12 word seed (BIP-39). Sharing this seed allows user to enter the chat and everybody will see all the messages
- App should have delivery and read notification for each message, so users can see if message was sync'ed and read by at least one other device
- App should not need to create a user/login. When a new chat is created, a new 12 word see is generated
- Users should be able to copy/paste images and images should be rendered on the screen. Clicking on image sohuld bring it to full size
- App should have a way to delete all messages from a chat and the deleted messages should be removed from local storage (to free up space) and from jazz.tools relay server
- IMPORTANT: good and smooth integration with mobile devices (iOS specially) MUST be a priority
- IMPORTANT: A good and reliable iOS push notification through PWA is a MUST
- MUST not reinvent the wheel. MUST use best-practice guidelines from all libraries involved

# Software Stack
- Develop in Next.JS
- Use Serwist (https://github.com/serwist/serwist) for the engine for PWA
- Front-end: ShadCN ( https://ui.shadcn.com/docs )
- Back-end: database to be used: Jazz.tools with E2EE using a 12 word mneomonic seed (BIP39)
- For the chat UI/UX: use ChatBubbles ( https://shadcnuikit.com/components/cards/chat-bubble )
- For handling the images that users can copy&paste to the chat: use `jazz-tools/media` with `createImage()` function

# UI/UX
- App should be Dark-mode by default but user should be able to select color theme
- IMPORTANT that push notification works RELIABLY for PWA on iOS
- on Desktop, when there is a new message received, the tab on the desktop bar should start blinking until the message is read (tab opened)
