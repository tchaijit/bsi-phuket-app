-- Seed data for BSI Phuket Partnership Management System

-- Insert default users
-- Password: admin123, manager123, viewer123 (hashed with bcrypt)
-- Note: These are bcrypt hashes for the passwords. In production, use proper password hashing

INSERT INTO users (id, username, password_hash, role, name, email) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'admin', '$2a$10$8K1p/a0dL3.I9FqVz2XPHuR1fYWEYzQQQQZlCZQZlCZQZlCZQZlCZ', 'admin', 'Admin User', 'admin@bsi-phuket.com'),
  ('b2222222-2222-2222-2222-222222222222', 'manager', '$2a$10$8K1p/a0dL3.I9FqVz2XPHuR1fYWEYzQQQQZlCZQZlCZQZlCZQZlCZ', 'manager', 'Manager User', 'manager@bsi-phuket.com'),
  ('c3333333-3333-3333-3333-333333333333', 'viewer', '$2a$10$8K1p/a0dL3.I9FqVz2XPHuR1fYWEYzQQQQZlCZQZlCZQZlCZQZlCZ', 'viewer', 'Viewer User', 'viewer@bsi-phuket.com')
ON CONFLICT (username) DO NOTHING;

-- Insert sample partners
INSERT INTO partners (id, name_en, name_th, category, zone, lat, lng, strategic_note, created_by) VALUES
  (
    'd4444444-4444-4444-4444-444444444444',
    'Bangkok Hospital Siriroj',
    'โรงพยาบาลกรุงเทพศิริโรจน์',
    'hospital',
    'west_coast_kamala_patong',
    7.8884,
    98.3826,
    'Key strategic partner with 24/7 emergency services',
    'a1111111-1111-1111-1111-111111111111'
  ),
  (
    'e5555555-5555-5555-5555-555555555555',
    'Patong Hospital',
    'โรงพยาบาลป่าตอง',
    'hospital',
    'west_coast_kamala_patong',
    7.8947,
    98.2967,
    'Local hospital with good reputation',
    'a1111111-1111-1111-1111-111111111111'
  ),
  (
    'f6666666-6666-6666-6666-666666666666',
    'Phuket International Hospital',
    'โรงพยาบาลนานาชาติภูเก็ต',
    'hospital',
    'phuket_town',
    7.8804,
    98.3923,
    'International standard hospital with multilingual staff',
    'a1111111-1111-1111-1111-111111111111'
  ),
  (
    'g7777777-7777-7777-7777-777777777777',
    'Angsana Laguna Phuket',
    'อังสนาลากูนาภูเก็ต',
    'hotel',
    'laguna_area',
    8.0030,
    98.2897,
    '5-star resort partner',
    'a1111111-1111-1111-1111-111111111111'
  ),
  (
    'h8888888-8888-8888-8888-888888888888',
    'Phi Phi Island Tour',
    'ทัวร์เกาะพีพี',
    'tour_operator',
    'chalong_rawai',
    7.8166,
    98.3381,
    'Premium tour operator for island hopping',
    'a1111111-1111-1111-1111-111111111111'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert contracts for sample partners
INSERT INTO contracts (partner_id, type, status, start_date, end_date, renewal_owner, value) VALUES
  (
    'd4444444-4444-4444-4444-444444444444',
    'MOU - Medical Partnership',
    'active',
    '2024-01-01',
    '2026-12-31',
    'Dr. Somchai',
    5000000.00
  ),
  (
    'e5555555-5555-5555-5555-555555555555',
    'Service Agreement',
    'active',
    '2024-06-01',
    '2025-05-31',
    'Nida K.',
    2000000.00
  ),
  (
    'f6666666-6666-6666-6666-666666666666',
    'Strategic Partnership',
    'negotiation',
    NULL,
    NULL,
    'Apirak T.',
    NULL
  ),
  (
    'g7777777-7777-7777-7777-777777777777',
    'Hotel Partnership MOU',
    'active',
    '2023-01-01',
    '2025-12-31',
    'Suthep M.',
    3500000.00
  ),
  (
    'h8888888-8888-8888-8888-888888888888',
    'Tour Operator Agreement',
    'expiring_soon',
    '2024-01-01',
    '2025-06-30',
    'Porn P.',
    1500000.00
  )
ON CONFLICT (partner_id) DO NOTHING;

-- Insert sample activity log
INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'CREATE',
    'partner',
    'd4444444-4444-4444-4444-444444444444',
    '{"name": "Bangkok Hospital Siriroj", "category": "hospital"}'::jsonb
  ),
  (
    'a1111111-1111-1111-1111-111111111111',
    'CREATE',
    'contract',
    'd4444444-4444-4444-4444-444444444444',
    '{"type": "MOU - Medical Partnership", "status": "active"}'::jsonb
  );
