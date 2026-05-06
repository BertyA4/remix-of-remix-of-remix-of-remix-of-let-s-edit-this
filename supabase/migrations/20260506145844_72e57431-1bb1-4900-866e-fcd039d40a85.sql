DO $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'zx.piham_47@gmail.com';
  
  IF uid IS NULL THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      'zx.piham_47@gmail.com',
      crypt('T9$k!vQ2@Lx#7mPz_4R!aW8', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin"}'::jsonb,
      '', '', '', ''
    );
  ELSE
    UPDATE auth.users SET
      encrypted_password = crypt('T9$k!vQ2@Lx#7mPz_4R!aW8', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      banned_until = NULL,
      deleted_at = NULL,
      updated_at = now(),
      aud = 'authenticated',
      role = 'authenticated',
      raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"provider":"email","providers":["email"]}'::jsonb,
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      email_change = COALESCE(email_change, '')
    WHERE id = uid;
  END IF;

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), uid,
    jsonb_build_object('sub', uid::text, 'email', 'zx.piham_47@gmail.com', 'email_verified', true),
    'email', uid::text, now(), now(), now())
  ON CONFLICT (provider, provider_id) DO UPDATE SET
    identity_data = jsonb_build_object('sub', uid::text, 'email', 'zx.piham_47@gmail.com', 'email_verified', true),
    updated_at = now();

  INSERT INTO public.profiles (id, full_name) VALUES (uid, 'Admin')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;