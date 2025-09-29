-- Create tables with proper constraints
CREATE TABLE job_title (
  job_title_id BIGSERIAL PRIMARY KEY,
  title TEXT UNIQUE NOT NULL
);

CREATE TABLE company (
  company_id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  website TEXT,
  logo_url TEXT
);

CREATE TABLE location (
  location_id BIGSERIAL PRIMARY KEY,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  UNIQUE(city, state, country)
);

CREATE TABLE level (
  level_id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES company(company_id),
  job_title_id BIGINT NOT NULL REFERENCES job_title(job_title_id),
  level_name TEXT NOT NULL,
  description TEXT,
  UNIQUE(company_id, job_title_id, level_name)
);

CREATE INDEX idx_level_company_title ON level(company_id, job_title_id);

CREATE TABLE salary_submission (
  submission_id BIGSERIAL PRIMARY KEY,
  user_id UUID NULL,
  company_id BIGINT NOT NULL REFERENCES company(company_id),
  job_title_id BIGINT NOT NULL REFERENCES job_title(job_title_id),
  location_id BIGINT NOT NULL REFERENCES location(location_id),
  level_id BIGINT NULL REFERENCES level(level_id),
  base_salary NUMERIC NOT NULL,
  bonus NUMERIC DEFAULT 0,
  stock_compensation NUMERIC DEFAULT 0,
  years_of_experience INTEGER NOT NULL,
  years_at_company INTEGER DEFAULT 0,
  submission_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_submission_query ON salary_submission(job_title_id, company_id, location_id, level_id);

-- Enable Row Level Security
ALTER TABLE salary_submission ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "public_read_salary_submission"
ON salary_submission FOR SELECT
TO public USING (true);

CREATE POLICY "public_insert_salary_submission"
ON salary_submission FOR INSERT
TO public WITH CHECK (true);