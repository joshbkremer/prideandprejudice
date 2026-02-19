-- Pride & Prejudice Book Collection Schema
-- Run this in the Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Jane Austen',
  year_published INTEGER,
  description TEXT,
  edition TEXT,
  publisher TEXT,
  condition TEXT CHECK (condition IN ('Mint', 'Very Good', 'Good', 'Fair', 'Poor')),
  acquisition_date DATE,
  acquisition_notes TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Anyone can read books
CREATE POLICY "public_read" ON books
  FOR SELECT USING (true);

-- Only authenticated users (admin) can write
CREATE POLICY "admin_insert" ON books
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_update" ON books
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "admin_delete" ON books
  FOR DELETE USING (auth.role() = 'authenticated');

-- -------------------------------------------------------
-- Book images table (multiple images per book)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS book_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  position INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one image per book can be primary
CREATE UNIQUE INDEX IF NOT EXISTS book_images_one_primary
  ON book_images (book_id)
  WHERE is_primary = true;

ALTER TABLE book_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_images" ON book_images
  FOR SELECT USING (true);

CREATE POLICY "admin_insert_images" ON book_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_update_images" ON book_images
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "admin_delete_images" ON book_images
  FOR DELETE USING (auth.role() = 'authenticated');

-- -------------------------------------------------------
-- Storage: run these or create the bucket manually in UI
-- -------------------------------------------------------
-- In Supabase Dashboard → Storage → New bucket
--   Name: covers
--   Public bucket: YES (checked)
--
-- Then add storage policies:
-- INSERT policy for authenticated users:
--   CREATE POLICY "admin_upload" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');
-- DELETE policy for authenticated users:
--   CREATE POLICY "admin_delete_cover" ON storage.objects
--     FOR DELETE USING (bucket_id = 'covers' AND auth.role() = 'authenticated');
