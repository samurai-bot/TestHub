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

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   touch .env.local
   ```
   Add the following to `.env.local`:
   ```
   NODE_ENV=development
   DATABASE_URL="file:./prisma/dev.db"
   WEBHOOK_SECRET=your-secret-here
   ```

4. Set up the database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Seed the database with sample data:
   ```bash
   npm run seed
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

### Production Deployment

#### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   ```
   DATABASE_URL=your-production-database-url
   WEBHOOK_SECRET=your-webhook-secret
   TESTHUB_API_TOKEN=your-api-token
   ```
3. Deploy automatically on push to main

#### GitHub Actions Setup
The repository includes automated testing via GitHub Actions:

1. **Set repository secrets:**
   - `TESTHUB_API_URL`: Your deployed TestHub URL
   - `WEBHOOK_SECRET`: Same as in your .env
   - `TESTHUB_API_TOKEN`: API token for TestHub access

2. **Automatic test execution:**
   - Daily at 6 AM UTC
   - On push to main branch
   - Manual trigger via GitHub Actions

3. **Test results:**
   - Automatically reported back to TestHub
   - Available in GitHub Actions artifacts
   - HTML reports generated for each run

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