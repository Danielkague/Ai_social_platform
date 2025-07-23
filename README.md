# SafeSocial - AI-Powered Social Platform

A modern social media platform built with Next.js, React, and Supabase, featuring AI-powered hate speech detection, real-time moderation, and an admin dashboard.

## Features

- User registration and login (Supabase Auth)
- User profiles
- Posting and commenting
- **AI-powered hate speech and abuse detection (Python ML server integration, fully operational)**
- Like and report functionality for posts and comments
- **Automatic reporting of flagged content to admins**
- Admin dashboard for viewing and moderating reports
- Ban users and delete abusive comments
- Real-time updates (optional)

## Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, Realtime)
- **AI Moderation:** Python ML server (integrated via API, hardcoded URL for reliability)

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

### 5. Start the AI Moderation Server

- Run the ML server:
  ```bash
  python scripts/ml-integration-example.py
  ```
- The ML server URL is hardcoded as `http://localhost:5000` in the API routes for reliability.
- **requirements.txt is up to date.**

---

## Supabase Setup

- Run the SQL in `supabase_schema.sql` in the Supabase SQL Editor to create tables and relationships.
- Make sure RLS (Row Level Security) is disabled for development.
- Add your admin user in the `profiles` table and set `is_admin = true`.

---

## Admin Dashboard & Moderation Flow

- All posts and comments are analyzed by the AI model for hate speech, abuse, and other forms of bad language.
- If content is flagged by the AI, it is **auto-reported** to the `reports` table with the reason "Auto-flagged by AI moderation".
- Flagged content is hidden from regular users and visible only to admins/moderators.
- Admins can review, approve, or remove flagged content and ban users if necessary.
- Users are notified if their comment is flagged and can appeal the decision via the support chatbot.

---

## Troubleshooting ML Server Integration

- If moderation is not working, ensure the ML server is running on `http://localhost:5000`.
- The ML server URL is hardcoded in `app/api/posts/route.ts` and `app/api/comments/route.ts` for reliability.
- Check the ML server logs for errors. If you see `Object of type bool is not JSON serializable`, ensure you are running the latest code with the type conversion fix.
- Use `/health` and `/model-stats` endpoints to verify the ML server is up.

---

## Deployment

- The project is ready for deployment to Render or similar platforms.
- Ensure both the Next.js frontend and the ML server are deployed and accessible.
- Update the ML server URL in the code if deploying to a different host.

---

## Security & Best Practices

- **Never commit your `.env.local` or Supabase service role key to the repo.**
- Use the provided `.gitignore` to keep sensitive files out of version control.
- For production, enable RLS and add appropriate policies.

---

## License

MIT
