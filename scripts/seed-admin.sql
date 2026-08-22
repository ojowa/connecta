DO $$
DECLARE
  admin_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'admin@connecta.app') THEN
    INSERT INTO admin_users (id, email, "passwordHash", name, role, "isActive", "tfaEnabled", "createdAt", "updatedAt")
    VALUES (admin_id, 'admin@connecta.app', '$2a$12$Axdk11o6o9GUfcmYSBokIeg8QcKe7X4VSAtGCNe5THT.TwJI1wC52', 'System Admin', 'super_admin', true, false, NOW(), NOW());
    RAISE NOTICE 'Admin created: admin@connecta.app (id: %)', admin_id;
  ELSE
    RAISE NOTICE 'Admin already exists';
  END IF;
END $$;
