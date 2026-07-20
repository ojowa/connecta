import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('connecta.db');
  await db.execAsync('PRAGMA journal_mode=WAL;');
  await db.execAsync('PRAGMA foreign_keys=ON;');
  await runMigrations(db);
  return db;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const applied = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM _migrations ORDER BY version'
  );
  const appliedVersions = new Set(applied.map((r) => r.version));

  const migrations = [
    { version: 1, up: migration001 },
    { version: 2, up: migration002 },
    { version: 3, up: migration003 },
    { version: 4, up: migration004 },
  ];

  for (const migration of migrations) {
    if (!appliedVersions.has(migration.version)) {
      await db.execAsync('BEGIN TRANSACTION;');
      try {
        await migration.up(db);
        await db.runAsync('INSERT INTO _migrations (version) VALUES (?);', [migration.version]);
        await db.execAsync('COMMIT;');
      } catch (error) {
        await db.execAsync('ROLLBACK;');
        throw new Error(`Migration ${migration.version} failed`);
      }
    }
  }
}

async function migration001(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      display_name TEXT NOT NULL,
      bio TEXT,
      date_of_birth TEXT NOT NULL,
      gender TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      last_active_at TEXT,
      is_verified INTEGER DEFAULT 0,
      profile_completion INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS preferences (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      min_age INTEGER DEFAULT 18,
      max_age INTEGER DEFAULT 50,
      max_distance INTEGER DEFAULT 50,
      gender_preference TEXT DEFAULT 'all',
      show_me INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS interests (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      category TEXT
    );
    CREATE TABLE IF NOT EXISTS user_interests (
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      interest_id TEXT REFERENCES interests(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, interest_id)
    );
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      local_path TEXT,
      position INTEGER DEFAULT 0,
      is_primary INTEGER DEFAULT 0,
      blur_hash TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

async function migration002(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY NOT NULL,
      last_message_id TEXT,
      last_message_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS conversation_participants (
      conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      joined_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (conversation_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY NOT NULL,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      type TEXT DEFAULT 'text',
      status TEXT DEFAULT 'sent',
      reply_to TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS message_reactions (
      message_id TEXT REFERENCES messages(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      emoji TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (message_id, user_id)
    );
  `);
}

async function migration003(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      local_path TEXT,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      width INTEGER,
      height INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS match_media (
      match_id TEXT NOT NULL,
      media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
      PRIMARY KEY (match_id, media_id)
    );
  `);
}

async function migration004(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      priority INTEGER DEFAULT 0,
      retry_count INTEGER DEFAULT 0,
      error TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS id_mappings (
      local_id TEXT NOT NULL,
      server_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      synced_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (local_id, entity_type)
    );
  `);
}
