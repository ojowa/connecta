import { ConfigService as NestConfigService } from '@nestjs/config';
import { AppConfigService } from './config.service';

function makeService(env: Record<string, string | undefined>): AppConfigService {
  const stub = {
    get: (key: string) => env[key],
  };
  return new AppConfigService(stub as unknown as NestConfigService);
}

describe('AppConfigService', () => {
  it('returns the default when a key is missing', () => {
    const svc = makeService({});
    expect(svc.get('MISSING_KEY', 'fallback')).toBe('fallback');
  });

  it('returns the value when a key is set', () => {
    const svc = makeService({ APP_NAME: 'Connecta' });
    expect(svc.get('APP_NAME')).toBe('Connecta');
  });

  it('throws a clear error for missing required config', () => {
    const svc = makeService({});
    expect(() => svc.getRequired('JWT_SECRET')).toThrow('Missing required config: JWT_SECRET');
  });

  it('parses DATABASE_URL into connection parts', () => {
    const svc = makeService({
      DATABASE_URL: 'postgresql://user:pass@db.example.com:5433/mydb',
    });
    expect(svc.database).toMatchObject({
      host: 'db.example.com',
      port: 5433,
      username: 'user',
      password: 'pass',
      database: 'mydb',
    });
  });

  it('falls back to DB_* variables with a default port', () => {
    const svc = makeService({
      DB_HOST: 'localhost',
      DB_USERNAME: 'app',
      DB_PASSWORD: 'secret',
      DB_NAME: 'connecta',
    });
    expect(svc.database).toMatchObject({
      host: 'localhost',
      port: 5432,
      username: 'app',
      database: 'connecta',
    });
  });

  it('builds redis config from REDIS_URL', () => {
    expect(makeService({ REDIS_URL: 'redis://cache:6379' }).redis).toEqual({
      url: 'redis://cache:6379',
    });
  });

  it('returns redis defaults when REDIS_URL is not set', () => {
    expect(makeService({}).redis).toEqual({
      host: 'localhost',
      port: 6379,
      password: undefined,
      db: 0,
    });
  });

  it('provides app defaults', () => {
    expect(makeService({}).app).toMatchObject({
      name: 'OJChat',
      port: 3000,
      nodeEnv: 'development',
    });
  });

  it('requires JWT secret for jwt config', () => {
    expect(() => makeService({}).jwt).toThrow('Missing required config: JWT_SECRET');
    expect(makeService({ JWT_SECRET: 's3cret' }).jwt).toEqual({
      secret: 's3cret',
      accessExpiresIn: '15m',
      refreshExpiresIn: '7d',
    });
  });
});
