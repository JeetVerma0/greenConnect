# GreenConnect

Community-driven environmental reporting and cleanup platform built with Next.js, Firebase, Google Maps, and Gemini.

## Project Structure

```
greenconnect/
├── public/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # UI and feature components
│   ├── lib/              # Firebase, Gemini, Maps, auth clients
│   ├── services/         # Data and API service layers
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand state stores
│   ├── types/            # Shared TypeScript types
│   ├── utils/            # Helpers and constants
│   └── assets/           # Static assets
├── .env.local
├── package.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## Getting Started

1. Copy environment variables into `.env.local` (Firebase, Gemini, Google Maps keys).
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Routes

- `/` — Home
- `/dashboard` — Activity overview
- `/reports` — Environmental reports
- `/teams` — Team management
- `/map` — Map view
- `/profile` — User profile
- `/auth` — Authentication
