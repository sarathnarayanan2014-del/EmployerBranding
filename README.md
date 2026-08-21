# HR Mitra — Employer Brand Command Center

A client-wise operational tool for HR Mitra's Employer Branding Scope of Work:
Measure → Diagnose → Transform → Communicate → Monitor, packaged into
**EB Starter / EB Growth / EB 360** tiers, with a separate **Admin login**
and a scoped **Company login** per client.

- Frontend: React + Vite, deployable as a static site to **GitHub Pages**
- Backend: **Supabase** (Postgres + Auth + Row Level Security + one Edge Function)

## How access control actually works

This is real, database-enforced separation — not just hidden UI:

- Every login is a real **Supabase Auth** user.
- A `profiles` table tags each user as `role = 'admin'` or `role = 'company'`
  (with a `client_id` for company users).
- **Row Level Security (RLS)** policies on `clients` and `module_data` check
  that role/client_id on every single database query. A company login
  physically cannot read another company's rows, even if someone opened
  dev tools and queried Supabase directly.
- Admin accounts can see and edit every client. Company accounts only ever
  see the one client they're linked to.

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project.
2. Once it's up, open **SQL Editor** → paste the contents of
   `supabase/schema.sql` → Run. This creates the tables, helper functions,
   and RLS policies.
3. Go to **Project Settings → API** and copy your **Project URL** and
   **anon public key**.

## 2. Configure the frontend

```bash
cp .env.example .env.local
# edit .env.local and paste your Project URL + anon key
npm install
npm run dev
```

## 3. Create your first Admin account

1. In Supabase Dashboard → **Authentication → Users → Add user**, create
   yourself an account (email + password).
2. Back in **SQL Editor**, run (with your real email):
   ```sql
   insert into public.profiles (id, role, display_name)
   select id, 'admin', 'HR Mitra Admin' from auth.users
   where email = 'you@hrmitra.example'
   on conflict (id) do update set role = 'admin';
   ```
3. Log in at your local dev URL using the **Admin Login** tab.

## 4. Enable company logins (Edge Function)

Creating a company login from the Admin dashboard calls a Supabase Edge
Function (`create-company-user`) so the powerful `service_role` key never
touches the browser.

```bash
npm install -g supabase   # if you don't have the CLI
supabase login
supabase link --project-ref YOUR-PROJECT-REF
supabase functions deploy create-company-user
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

(Find the service role key in Project Settings → API — keep it secret,
it's only ever used here, server-side.)

Once deployed, the Admin dashboard's **⚙ Manage Company Logins** panel
will create real, working client logins.

## 5. Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In repo **Settings → Pages**, set Source = "GitHub Actions".
3. In repo **Settings → Secrets and variables → Actions**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Push to `main` — `.github/workflows/deploy.yml` builds and deploys
   automatically. Your site will be live at
   `https://<your-username>.github.io/<repo-name>/`.

## Project structure

```
src/
  lib/
    supabaseClient.js     Supabase client (reads .env)
    AuthContext.jsx       session + role/profile state
    useModuleData.js      load/save one client's module data
  components/
    LoginScreen.jsx        admin/company toggle, mascot art
    AdminDashboard.jsx     client list, tier control, manage logins
    CompanyDashboard.jsx   single-client scoped view
    modules/               Form / List / Checklist / Pipeline / Metrics
  modules/config.js        the 12 SOW modules + tier gating, in one place
supabase/
  schema.sql               tables + RLS policies
  functions/create-company-user/  edge function for admin-created logins
```

To add a 13th module later, add one entry to `TAB_DEFS` in
`src/modules/config.js` and list it in the relevant tier(s) in
`TIER_MODULES` — no other code changes needed for form/list/checklist
module types.

## Mascots

`src/assets/arjun-mitra.png` (Admin login) and
`src/assets/anjali-mitra.png` (Company login) are HR Mitra's brand
mascots. Swap the files to update the artwork — no code changes needed.
