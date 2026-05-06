
DO $$
DECLARE
  new_user_id uuid;
  existing_id uuid;
BEGIN
  SELECT id INTO existing_id FROM auth.users WHERE email = 'zx.piham_47@gmail.com';

  IF existing_id IS NULL THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated',
      'zx.piham_47@gmail.com',
      crypt('T9$k!vQ2@Lx#7mPz_4R!aW8', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', 'zx.piham_47@gmail.com', 'email_verified', true),
      'email', new_user_id::text, now(), now(), now());
  ELSE
    new_user_id := existing_id;
    UPDATE auth.users
      SET encrypted_password = crypt('T9$k!vQ2@Lx#7mPz_4R!aW8', gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          updated_at = now()
      WHERE id = new_user_id;
  END IF;

  INSERT INTO public.profiles (id, full_name)
    VALUES (new_user_id, 'Admin')
    ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
END $$;
