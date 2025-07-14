# SafeSocial - AI-Powered Social Platform

A modern social media platform built with Next.js, React, and Supabase, featuring AI-powered hate speech detection, real-time moderation, and an admin dashboard.

## Features

- User registration and login (Supabase Auth)
- User profiles
- Posting and commenting
- AI-powered hate speech and abuse detection (Python ML server integration)
- Like and report functionality for posts and comments
- Admin dashboard for viewing and moderating reports
- Ban users and delete abusive comments
- Real-time updates (optional)

## Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, Realtime)
- **AI Moderation:** Python ML server (integrated via API)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get these values from your Supabase dashboard (Project Settings → API).

### 4. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

### 5. (Optional) Start the AI Moderation Server

- See `scripts/ml-integration-example.py` for a sample Python ML server.
- Update your `.env.local` with the ML server URL if needed:
  ```env
  ML_SERVER_URL=http://localhost:5000
  ```

---

## Supabase Setup

- Run the SQL in `supabase_schema.sql` in the Supabase SQL Editor to create tables and relationships.
- Make sure RLS (Row Level Security) is disabled for development.
- Add your admin user in the `profiles` table and set `is_admin = true`.

---

## Admin Dashboard

- Log in as an admin user (with `is_admin = true` in `profiles`).
- Click the **Admin Dashboard** link in the navigation bar.
- View all reported comments, see who reported and why.
- **Delete** abusive comments or **ban** users directly from the dashboard.

---

## Moderation & Banning

- When a comment is reported, its content is copied into the report for permanent record.
- Banned users (`banned = true` in `profiles`) cannot log in or post.

---

## Security & Best Practices

- **Never commit your `.env.local` or Supabase service role key to the repo.**
- Use the provided `.gitignore` to keep sensitive files out of version control.
- For production, enable RLS and add appropriate policies.

---

## License

MIT
