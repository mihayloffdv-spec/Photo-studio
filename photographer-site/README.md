# Photographer Portfolio & Client Gallery

A Next.js application for professional photographers to showcase their work and deliver photos to clients.

## Features (Current)

- **Portfolio page** - Main landing page with placeholder for portfolio photos
- **Admin panel** - Create galleries, upload photos, manage client access
- **Client galleries** - Clients access their photos via unique codes
- **Photo management** - Upload, view, and delete photos
- **Expiration tracking** - Galleries expire after 1 year

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Admin Access

Go to `/admin` and enter password: `admin123`

(Change `ADMIN_PASSWORD` in `.env` for production)

## Project Structure

```
photographer-site/
├── app/
│   ├── page.tsx              # Portfolio homepage
│   ├── gallery/[code]/       # Client gallery view
│   ├── admin/                # Admin panel
│   │   ├── page.tsx          # Gallery list
│   │   ├── upload/           # Create new gallery
│   │   └── gallery/[id]/     # Manage gallery
│   └── api/                  # API routes
│       ├── auth/             # Admin authentication
│       ├── galleries/        # Gallery CRUD
│       └── photos/           # Photo upload/delete
├── components/               # Shared components
├── lib/                      # Utilities & Prisma client
├── prisma/                   # Database schema
└── public/uploads/           # Photo storage (local)
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Database**: SQLite (Prisma ORM)
- **Storage**: Local filesystem (public/uploads)

## Roadmap

### Phase 1: MVP
- [ ] Replace SQLite → Neon Postgres
- [ ] Replace local files → Cloudflare R2
- [ ] Add NextAuth (email magic link)
- [ ] Share links for friends
- [ ] Mini survey after viewing
- [ ] Email notifications (Resend)

### Phase 2: CRM + AI
- [ ] CRM: client profiles, history
- [ ] Trigger mailings (birthdays, holidays)
- [ ] Storage expiration reminders
- [ ] Stripe: payment for extension
- [ ] NanoBanana integration: retouching

### Phase 3: Expansion
- [ ] AI generation (business photos, influencer)
- [ ] Print-on-demand integration

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="admin123"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npx prisma studio # Open database GUI
```
