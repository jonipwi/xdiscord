# 8088 XChat Frontend

A modern Next.js-based real-time chat application with two distinct modes: **Full Chat** and **XChat Lite**.

## Features

### Full Chat Mode (`/`)
- Real-time messaging via WebSocket
- Multiple chat rooms
- User presence and typing indicators
- File uploads (images, audio, documents)
- Rich message types (text, emoticons, graphs, voting)
- User management (ban/unban)
- Light/dark theme support

### XChat Lite Mode (`/lite`)
- Lightweight, simplified chat interface
- Optimized for elderly and mobile users
- **Heavenly Treasure Vault** - Spiritual-themed Solana wallet
  - Matthew 6:19-21 inspired design
  - ED25519 keypair generation
  - BIP39 mnemonic phrase backup
  - Multi-currency balance (SOL, USDT, USDC)
  - AES-256 encrypted private key storage
- **PFI Metrics** - Performance Fairness Index tracking
- Profile customization with avatar upload
- Large text and buttons for accessibility
- Professional, elder-friendly UI design

## Getting Started

### Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8088
NEXT_PUBLIC_FAIRCOIN_API_URL=https://bixio.xyz/faircoin
```

### Available Routes

- `/` - Full chat interface
- `/lite?username={name}` - Lite mode with username
- `/lite/settings?username={name}` - Settings page with wallet and PFI metrics

## Key Technologies

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
