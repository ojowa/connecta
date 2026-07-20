import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  get(key: string, defaultValue?: any): any {
    const value = this.configService.get(key);
    return value !== undefined ? value : defaultValue;
  }

  getRequired(key: string): string {
    const value = this.configService.get<string>(key);
    if (value === undefined || value === null) {
      throw new Error(`Missing required config: ${key}`);
    }
    return value;
  }

  get database() {
    return {
      host: this.getRequired('DB_HOST'),
      port: this.get('DB_PORT', 5432),
      username: this.getRequired('DB_USERNAME'),
      password: this.getRequired('DB_PASSWORD'),
      database: this.getRequired('DB_DATABASE'),
      synchronize: this.get('DB_SYNCHRONIZE', false),
      ssl: this.get('DB_SSL', false),
    };
  }

  get redis() {
    return {
      host: this.get('REDIS_HOST', 'localhost'),
      port: this.get('REDIS_PORT', 6379),
      password: this.get('REDIS_PASSWORD'),
      db: this.get('REDIS_DB', 0),
    };
  }

  get jwt() {
    return {
      secret: this.getRequired('JWT_SECRET'),
      accessExpiresIn: this.get('JWT_ACCESS_EXPIRES_IN', '15m'),
      refreshExpiresIn: this.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    };
  }

  get smtp() {
    return {
      host: this.getRequired('SMTP_HOST'),
      port: this.get('SMTP_PORT', 587),
      user: this.getRequired('SMTP_USER'),
      pass: this.getRequired('SMTP_PASS'),
      from: this.get('SMTP_FROM', 'Connecta <no-reply@connecta.ng>'),
    };
  }

  get firebase() {
    return {
      projectId: this.getRequired('FIREBASE_PROJECT_ID'),
      clientEmail: this.getRequired('FIREBASE_CLIENT_EMAIL'),
      privateKey: this.getRequired('FIREBASE_PRIVATE_KEY'),
    };
  }

  get cloudinary() {
    return {
      cloudName: this.getRequired('CLOUDINARY_CLOUD_NAME'),
      apiKey: this.getRequired('CLOUDINARY_API_KEY'),
      apiSecret: this.getRequired('CLOUDINARY_API_SECRET'),
    };
  }

  get paystack() {
    return {
      secretKey: this.getRequired('PAYSTACK_SECRET_KEY'),
      publicKey: this.getRequired('PAYSTACK_PUBLIC_KEY'),
    };
  }

  get app() {
    return {
      name: this.get('APP_NAME', 'Connecta'),
      port: this.get('APP_PORT', 3000),
      nodeEnv: this.get('NODE_ENV', 'development'),
      frontendUrl: this.get('FRONTEND_URL', 'http://localhost:8081'),
      adminUrl: this.get('ADMIN_URL', 'http://localhost:3001'),
    };
  }
}
