# Pride & Prejudice Book Collection

A full-stack web application for showcasing and managing a personal Pride & Prejudice book collection.

- **Public gallery** — elegant Victorian-themed display of all editions
- **Admin panel** — login to create, edit, and delete books with cover image uploads
- **Tech stack** — React (Vite) frontend · Python FastAPI backend · Supabase (PostgreSQL + Auth + Storage)

---

## 1. Supabase Setup

### 1a. Create a project
1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name (e.g. `prideandprejudice`) and a strong database password

### 1b. Run the database schema
1. In your project dashboard: **SQL Editor** → **New query**
2. Paste the contents of [`supabase-schema.sql`](supabase-schema.sql) and click **Run**

### 1c. Create the storage bucket
1. Go to **Storage** → **New bucket**
2. Name: `covers`
3. Toggle **Public bucket** ON → **Create bucket**
4. Go to **Storage** → **Policies** → Add the following two policies on `storage.objects`:

   **INSERT** (authenticated users can upload):
   ```sql
   CREATE POLICY "admin_upload" ON storage.objects
     FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');
   ```

   **DELETE** (authenticated users can remove covers):
   ```sql
   CREATE POLICY "admin_delete_cover" ON storage.objects
     FOR DELETE USING (bucket_id = 'covers' AND auth.role() = 'authenticated');
   ```

### 1d. Create your admin user
1. Go to **Authentication** → **Users** → **Invite user** (or **Add user**)
2. Enter your email and a password — this is the account you'll log in with

### 1e. Collect your credentials
From **Project Settings → API**:

| Key | Used in |
|-----|---------|
| Project URL | frontend `.env` + backend `.env` |
| `anon` public key | frontend `.env` |
| `service_role` secret key | backend `.env` |

---

## 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and fill in your Supabase credentials
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

---

## 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

---

## 4. Usage

| URL | What you see |
|-----|-------------|
| `http://localhost:5173` | Public gallery |
| `http://localhost:5173/admin` | Login page (or admin panel if signed in) |

### Admin workflow
1. Navigate to `/admin` and sign in with your Supabase credentials
2. Click **+ Add New Book** to open the book form
3. Fill in the details and optionally upload a cover image
4. Save — the book appears immediately in the public gallery
5. Use **Edit** / **Delete** on any row to manage existing entries

---

## 5. Project Structure

```
prideandprejudice/
├── supabase-schema.sql       # Run once in Supabase SQL editor
├── backend/
│   ├── main.py               # FastAPI app (all routes)
│   ├── requirements.txt
│   └── .env.example          # Copy to .env and fill in credentials
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env.example           # Copy to .env and fill in credentials
    └── src/
        ├── main.jsx
        ├── App.jsx            # Router + auth session
        ├── index.css          # Global reset
        ├── lib/supabase.js    # Supabase client
        ├── components/
        │   ├── Navbar.jsx
        │   ├── BookCard.jsx
        │   ├── BookModal.jsx
        │   └── AdminBookForm.jsx
        └── pages/
            ├── Home.jsx       # Public gallery
            └── Admin.jsx      # Login + CRUD management
```
