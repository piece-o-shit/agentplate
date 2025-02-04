-- Create a test user in auth schema
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  jsonb_build_object('sub', '00000000-0000-0000-0000-000000000000'),
  'email',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;
