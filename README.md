# kingsleyabebe.org

Personal portfolio and blog built with Next.js. Features a CMS-powered admin dashboard, blog with subscriber notifications, project showcase, and a contact system.

## Tech Stack

**Framework:** Next.js 16 (App Router), React 19, TypeScript  
**Styling:** CSS Modules, Framer Motion  
**Backend:** Supabase (PostgreSQL, Auth, Storage)  
**Email:** Nodemailer (Gmail)  
**Analytics:** Google Analytics, custom view tracking  
**Deployment:** Vercel

## Features

- **Admin Dashboard** — Manage projects, blog posts, skills, services, experience, and site settings
- **Blog** — Rich text editor (Tiptap), comments, likes, and subscriber email notifications
- **Project Showcase** — Filterable portfolio with categories, tags, and live/GitHub links
- **Contact Form** — Validated form with email delivery to inbox
- **Theme Switcher** — Dark and light mode with system preference detection
- **SEO** — Dynamic metadata, Open Graph tags, and sitemap
- **Analytics** — Page view tracking and admin analytics panel with Recharts

## Project Structure

```
kingsleyabebe.org/
├── app/
│   ├── admin/        # Dashboard pages (blogs, projects, skills, etc.)
│   ├── api/          # Route handlers (contact, subscribe, analytics)
│   ├── blogs/        # Public blog pages
│   └── page.tsx      # Landing page
├── components/
│   ├── admin/        # Sidebar, layout, file upload, rich text editor
│   ├── blog/         # Comments, likes, subscribe section
│   ├── hero/         # Hero sections and showcase
│   └── theme/        # Theme provider and toggle
├── lib/
│   ├── supabase/     # Client and server Supabase instances
│   └── security.ts   # Input sanitization
└── styles/           # CSS Modules
```

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase project
- Gmail app password (for contact form)

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/Kyngslyabebe/kingsleyabebe.org.git
   cd kingsleyabebe.org
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   ```bash
   cp .env.example .env.local
   # Fill in Supabase URL, keys, and email credentials
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## License

License — Kingsley Abebe
