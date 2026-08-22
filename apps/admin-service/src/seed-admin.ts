import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'Aarinola',
    database: process.env.DB_DATABASE || 'connecta_db',
  });

  await ds.initialize();
  console.log('Connected to database');

  const email = process.argv[2] || 'admin@connecta.app';
  const password = process.argv[3] || 'AdminSecureP@ss1';
  const name = process.argv[4] || 'System Admin';
  const role = process.argv[5] || 'super_admin';

  const existing = await ds.query('SELECT id FROM admin_users WHERE email = $1', [email]);
  if (existing.length > 0) {
    console.log(`Admin "${email}" already exists (id: ${existing[0].id})`);
    await ds.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await ds.query(
    'INSERT INTO admin_users (email, "passwordHash", name, role, "isActive", "tfaEnabled", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, true, false, NOW(), NOW()) RETURNING id, email, name, role',
    [email, passwordHash, name, role]
  );

  console.log('Admin created:', result[0]);
  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
