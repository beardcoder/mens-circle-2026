# Männerkreis Niederbayern / Straubing

Community platform for organizing men's circle events, managing registrations, and newsletters.

## Tech Stack

| Component    | Technology                      |
| ------------ | ------------------------------- |
| **Frontend** | Next.js 16 (App Router, SSR)    |
| **CMS**      | Payload CMS 3                   |
| **Database** | SQLite                          |
| **Styling**  | Custom CSS (OKLCH color system) |

## Architecture

**Unified Application** – Single Next.js + Payload CMS app

```
├── cms/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (frontend)/      # Public website (SSR)
│   │   │   │   ├── [slug]/      # Dynamic pages
│   │   │   │   ├── events/      # Events listing
│   │   │   │   ├── testimonials/
│   │   │   │   └── page.tsx     # Homepage
│   │   │   └── (payload)/       # Admin panel + API
│   │   ├── components/          # React components
│   │   ├── lib/                 # Data fetching utilities
│   │   ├── styles/              # CSS
│   │   └── [collections, blocks, globals, endpoints]
│   ├── data/                    # SQLite database
│   └── public/                  # Static assets
```

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file
cp cms/.env.example cms/.env

# Run database migrations
cd cms
npx payload migrate

# Start development server
npm run dev
```

- **Website:** http://localhost:3001
- **Admin Panel:** http://localhost:3001/admin
- **API:** http://localhost:3001/api

On first launch, create an admin user at `/admin`.

## Data Model

```
Events ──hasMany──> Registrations ──belongsTo──> Participants
                                                     │
Newsletters                                         hasOne
NewsletterSubscriptions ──belongsTo─────────────────┘
Testimonials (standalone)
Pages ──has──> Content Blocks
SiteSettings (global)
```

## Content Blocks

Pages use a dynamic block system. Available blocks:

- `hero` – Full-screen hero section
- `intro` – Two-column intro layout
- `textSection` – Rich text content
- `valueItems` – Value cards grid
- `moderator` – Profile/bio section
- `journeySteps` – Step-by-step process
- `testimonials` – Community quotes (auto-loaded)
- `faq` – Accordion FAQ
- `newsletter` – Email signup form
- `cta` – Call-to-action section
- `whatsappCommunity` – WhatsApp join section

## API Endpoints

| Method | Endpoint                  | Purpose                 |
| ------ | ------------------------- | ----------------------- |
| POST   | `/api/register`           | Event registration      |
| POST   | `/api/subscribe`          | Newsletter subscription |
| GET    | `/api/unsubscribe/:token` | Newsletter unsubscribe  |
| POST   | `/api/send-newsletter`    | Send newsletter (admin) |

## Routes

| Route                  | Purpose                            |
| ---------------------- | ---------------------------------- |
| `/`                    | Homepage (dynamic blocks from CMS) |
| `/[slug]`              | Dynamic CMS pages                  |
| `/events`              | Events listing                     |
| `/events/[slug]`       | Event detail + registration        |
| `/testimonials`        | Testimonials page                  |
| `/admin`               | CMS Admin Panel                    |
| `/api/*`               | REST API endpoints                 |

## Development

```bash
npm run dev        # Start development server
npm run build      # Production build
npm start          # Start production server
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.

## Migration

For migration details from the old Astro setup, see [MIGRATION.md](MIGRATION.md).
