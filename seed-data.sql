-- Seed Industries
INSERT INTO industry (name, slug, icon) VALUES
('Technology', 'technology', '💻'),
('Finance', 'finance', '💰'),
('Healthcare', 'healthcare', '🏥'),
('Biotechnology', 'biotechnology', '🧬'),
('E-commerce', 'e-commerce', '🛒'),
('Gaming', 'gaming', '🎮'),
('Education', 'education', '📚'),
('Media & Entertainment', 'media-entertainment', '🎬'),
('Consulting', 'consulting', '💼'),
('Manufacturing', 'manufacturing', '🏭')
ON CONFLICT (slug) DO NOTHING;

-- Get the Technology industry ID for job titles
DO $$
DECLARE
  tech_id BIGINT;
BEGIN
  SELECT industry_id INTO tech_id FROM industry WHERE slug = 'technology';

  -- Seed Job Titles
  INSERT INTO job_title (title, industry_id, category, slug) VALUES
  ('Software Engineer', tech_id, 'Engineering', 'software-engineer'),
  ('Senior Software Engineer', tech_id, 'Engineering', 'senior-software-engineer'),
  ('Staff Software Engineer', tech_id, 'Engineering', 'staff-software-engineer'),
  ('Principal Software Engineer', tech_id, 'Engineering', 'principal-software-engineer'),
  ('Frontend Engineer', tech_id, 'Engineering', 'frontend-engineer'),
  ('Backend Engineer', tech_id, 'Engineering', 'backend-engineer'),
  ('Full Stack Engineer', tech_id, 'Engineering', 'full-stack-engineer'),
  ('DevOps Engineer', tech_id, 'Engineering', 'devops-engineer'),
  ('Site Reliability Engineer', tech_id, 'Engineering', 'site-reliability-engineer'),
  ('Data Engineer', tech_id, 'Engineering', 'data-engineer'),
  ('Machine Learning Engineer', tech_id, 'Engineering', 'machine-learning-engineer'),
  ('Data Scientist', tech_id, 'Data', 'data-scientist'),
  ('Product Manager', tech_id, 'Product', 'product-manager'),
  ('Senior Product Manager', tech_id, 'Product', 'senior-product-manager'),
  ('Product Designer', tech_id, 'Design', 'product-designer'),
  ('UX Designer', tech_id, 'Design', 'ux-designer'),
  ('Engineering Manager', tech_id, 'Management', 'engineering-manager'),
  ('Security Engineer', tech_id, 'Security', 'security-engineer')
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- Seed Companies
INSERT INTO company (name, slug, website, industry, headquarters) VALUES
('Google', 'google', 'https://google.com', 'Technology', 'Mountain View, CA'),
('Meta', 'meta', 'https://meta.com', 'Technology', 'Menlo Park, CA'),
('Amazon', 'amazon', 'https://amazon.com', 'Technology', 'Seattle, WA'),
('Microsoft', 'microsoft', 'https://microsoft.com', 'Technology', 'Redmond, WA'),
('Apple', 'apple', 'https://apple.com', 'Technology', 'Cupertino, CA'),
('Netflix', 'netflix', 'https://netflix.com', 'Technology', 'Los Gatos, CA'),
('Uber', 'uber', 'https://uber.com', 'Technology', 'San Francisco, CA'),
('Airbnb', 'airbnb', 'https://airbnb.com', 'Technology', 'San Francisco, CA'),
('Stripe', 'stripe', 'https://stripe.com', 'Technology', 'San Francisco, CA'),
('Shopify', 'shopify', 'https://shopify.com', 'Technology', 'Ottawa, Canada'),
('Andela', 'andela', 'https://andela.com', 'Technology', 'Lagos, Nigeria'),
('Flutterwave', 'flutterwave', 'https://flutterwave.com', 'Technology', 'Lagos, Nigeria'),
('Interswitch', 'interswitch', 'https://interswitch.com', 'Technology', 'Lagos, Nigeria')
ON CONFLICT (slug) DO NOTHING;

-- Seed Locations
INSERT INTO location (city, state, country, slug, region) VALUES
('San Francisco', 'CA', 'United States', 'san-francisco-ca-usa', 'North America'),
('New York', 'NY', 'United States', 'new-york-ny-usa', 'North America'),
('Seattle', 'WA', 'United States', 'seattle-wa-usa', 'North America'),
('Austin', 'TX', 'United States', 'austin-tx-usa', 'North America'),
('Boston', 'MA', 'United States', 'boston-ma-usa', 'North America'),
('Los Angeles', 'CA', 'United States', 'los-angeles-ca-usa', 'North America'),
('London', NULL, 'United Kingdom', 'london-uk', 'Europe'),
('Berlin', NULL, 'Germany', 'berlin-germany', 'Europe'),
('Amsterdam', NULL, 'Netherlands', 'amsterdam-netherlands', 'Europe'),
('Paris', NULL, 'France', 'paris-france', 'Europe'),
('Lagos', NULL, 'Nigeria', 'lagos-nigeria', 'Africa'),
('Nairobi', NULL, 'Kenya', 'nairobi-kenya', 'Africa'),
('Cape Town', NULL, 'South Africa', 'cape-town-south-africa', 'Africa'),
('Cairo', NULL, 'Egypt', 'cairo-egypt', 'Africa'),
('Toronto', 'ON', 'Canada', 'toronto-on-canada', 'North America'),
('Vancouver', 'BC', 'Canada', 'vancouver-bc-canada', 'North America')
ON CONFLICT (slug) DO NOTHING;
