UPDATE auth.users
SET encrypted_password = crypt('AdminPiham2026!', gen_salt('bf')),
    updated_at = now()
WHERE email = 'zx.piham_47@gmail.com';