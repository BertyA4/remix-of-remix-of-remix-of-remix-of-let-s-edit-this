UPDATE auth.users
SET encrypted_password = crypt('T9$k!vQ2@Lx#7mPz_4R!aW8', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'zx.piham_47@gmail.com';

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT gen_random_uuid(), u.id, u.id::text,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       'email', now(), now(), now()
FROM auth.users u
WHERE u.email = 'zx.piham_47@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM auth.identities i WHERE i.user_id = u.id AND i.provider = 'email');

INSERT INTO public.profiles (id, full_name)
SELECT id, 'Admin' FROM auth.users WHERE email = 'zx.piham_47@gmail.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'zx.piham_47@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;