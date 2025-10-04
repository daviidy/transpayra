-- Seed industries
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
