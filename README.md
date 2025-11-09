# Cartoon Generator

An AI-powered political cartoon generator that creates simple black and white cartoons based on user-provided topics. The application uses GPT-4 to generate cartoon descriptions and Flux 1.1 Pro to generate the actual images.

**Live Demo:** https://cartoon-gen.nivekithan.com/

## Features

- Generate political cartoons from text prompts
- AI-powered prompt enhancement using GPT-4
- High-quality image generation using Flux 1.1 Pro
- Gallery view of previously generated cartoons

## Architecture

This is a monorepo project built with:

- **Frontend (web):** React + Vite + TailwindCSS + shadcn/ui
- **Backend (backend):** Hono API running on Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Storage:** Cloudflare R2 for image storage
- **AI Services:** OpenAI GPT-4o for prompt generation, Replicate Flux 1.1 Pro for image generation

## Project Structure

```
cartoon_gen/
├── services/
│   ├── backend/          # Cloudflare Worker API
│   │   ├── src/
│   │   │   ├── index.ts  # Main API endpoints
│   │   │   └── db/       # Database schema and utilities
│   │   ├── migrations/   # D1 database migrations
│   │   └── wrangler.toml # Cloudflare Worker configuration
│   └── web/              # React frontend
│       ├── src/
│       │   ├── App.tsx   # Main application component
│       │   └── components/ # UI components (shadcn/ui)
│       └── vite.config.ts
├── package.json          # Root workspace configuration
├── turbo.json           # Turborepo configuration
└── pnpm-workspace.yaml  # PNPM workspace configuration
```

## How It Works

1. User submits a topic/prompt through the web interface
2. Backend sends the prompt to GPT-4o to generate an enhanced image prompt for a political cartoon
3. The enhanced prompt is sent to Replicate's Flux 1.1 Pro model to generate a black and white cartoon image
4. Generated image is stored in Cloudflare R2 bucket
5. Image metadata is saved to Cloudflare D1 database
6. Frontend displays the generated cartoon and maintains a gallery of all generated images

## API Endpoints

- `POST /generate` - Generate a new cartoon from a text prompt
  - Body: `{ "prompt": "your topic here" }`
  - Returns: Image URL and debug information

- `GET /images` - Retrieve all generated images
  - Returns: Array of image metadata (id, key, createdAt)

## Prerequisites

- Node.js (recommended: latest LTS version)
- pnpm 9.1.1 or later
- Cloudflare account with:
  - Workers enabled
  - D1 database
  - R2 bucket
  - Pages (for frontend deployment)
- OpenAI API key
- Replicate API token

## Environment Variables

### Backend (Cloudflare Worker secrets)

- `OPENAI_API_KEY` - OpenAI API key for GPT-4 access
- `REPLICATE_API_TOKEN` - Replicate API token for Flux 1.1 Pro
- `CARTOON_IMAGE_BUCKET` - Base URL for the R2 bucket

### Frontend

- `VITE_CARTOON_IMAGE_BUCKET` - Base URL for accessing images from R2 bucket

## Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd cartoon_gen
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up Cloudflare secrets for the backend:
```bash
cd services/backend
wrangler secret put OPENAI_API_KEY
wrangler secret put REPLICATE_API_TOKEN
wrangler secret put CARTOON_IMAGE_BUCKET
```

4. Run database migrations:
```bash
cd services/backend
pnpm run db:migrate:preview  # For preview environment
pnpm run db:migrate:production  # For production
```

5. Start the development servers:
```bash
# From the root directory
pnpm run dev
```

This will start both the frontend (web) and backend services using Turborepo.

## Deployment

### Backend (Cloudflare Workers)

```bash
cd services/backend
pnpm run deploy
```

### Frontend (Cloudflare Pages)

```bash
cd services/web
pnpm run build
pnpm run deploy
```

## Database Migrations

Generate new migrations:
```bash
cd services/backend
pnpm run db:generate
```

Apply migrations:
```bash
pnpm run db:migrate:preview  # Preview environment
pnpm run db:migrate:production  # Production environment
```

## Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- shadcn/ui components
- TanStack Query for data fetching
- Hono RPC client for type-safe API calls

### Backend
- Hono web framework
- Zod for validation
- Drizzle ORM for database
- OpenAI AI SDK
- Replicate SDK

### Infrastructure
- Cloudflare Workers (serverless backend)
- Cloudflare D1 (SQLite database)
- Cloudflare R2 (object storage)
- Cloudflare Pages (frontend hosting)

## Development Scripts

### Root
- `pnpm run dev` - Start all services in development mode with Turborepo

### Backend
- `pnpm run dev` - Start backend in development mode with remote bindings
- `pnpm run deploy` - Deploy to production
- `pnpm run test` - Run tests with Vitest
- `pnpm run db:generate` - Generate new database migrations
- `pnpm run db:migrate:preview` - Apply migrations to preview database
- `pnpm run db:migrate:production` - Apply migrations to production database

### Frontend
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run deploy` - Deploy to Cloudflare Pages
