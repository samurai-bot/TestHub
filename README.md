# TestHub

A modern test case management platform built with Next.js 14, TypeScript, Supabase, and Prisma.

## Features

- 🧪 Test case management
- 📊 Test run tracking
- 🎯 Project organization
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 🔐 Authentication with Supabase
- 📱 Responsive design

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase credentials.

4. Set up the database:
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx        # Dashboard (/)
│   ├── projects/       
│   │   └── [id]/       # Project details (/projects/[id])
│   │       └── cases/
│   │           └── new/ # New test case (/projects/[id]/cases/new)
│   ├── cases/
│   │   └── [caseId]/   # Test case details (/cases/[caseId])
│   └── runs/
│       └── [id]/       # Test run details (/runs/[id])
├── components/         # Reusable components
├── lib/               # Utilities and configurations
└── prisma/            # Database schema
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio