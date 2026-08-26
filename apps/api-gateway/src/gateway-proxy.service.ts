import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request, Response } from 'express';

export interface ServiceConfig {
  name: string;
  baseUrl: string;
  routes: string[];
}

@Injectable()
export class GatewayProxyService {
  private readonly logger = new Logger(GatewayProxyService.name);
  private readonly services: ServiceConfig[] = [
    {
      name: 'auth',
      baseUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      routes: ['auth'],
    },
    {
      name: 'users',
      baseUrl: process.env.USERS_SERVICE_URL || 'http://localhost:3002',
      routes: ['users'],
    },
    {
      name: 'matching',
      baseUrl: process.env.MATCHING_SERVICE_URL || 'http://localhost:3003',
      routes: ['matching'],
    },
    {
      name: 'chat',
      baseUrl: process.env.CHAT_SERVICE_URL || 'http://localhost:3004',
      routes: ['chat'],
    },
    {
      name: 'calls',
      baseUrl: process.env.CALLS_SERVICE_URL || 'http://localhost:3005',
      routes: ['calls'],
    },
    {
      name: 'media',
      baseUrl: process.env.MEDIA_SERVICE_URL || 'http://localhost:3006',
      routes: ['media', 'upload'],
    },
    {
      name: 'payments',
      baseUrl: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3007',
      routes: ['payments'],
    },
    {
      name: 'notifications',
      baseUrl: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3008',
      routes: ['notifications'],
    },
    {
      name: 'search',
      baseUrl: process.env.SEARCH_SERVICE_URL || 'http://localhost:3009',
      routes: ['search'],
    },
    {
      name: 'content',
      baseUrl: process.env.CONTENT_SERVICE_URL || 'http://localhost:3010',
      routes: ['content'],
    },
    {
      name: 'support',
      baseUrl: process.env.SUPPORT_SERVICE_URL || 'http://localhost:3011',
      routes: ['support'],
    },
    {
      name: 'admin',
      baseUrl: process.env.ADMIN_SERVICE_URL || 'http://localhost:3012',
      routes: ['admin'],
    },
  ];

  constructor(private readonly httpService: HttpService) {}

  findService(path: string): ServiceConfig | undefined {
    const segment = path.split('/').filter(Boolean)[0];
    return this.services.find((s) => s.routes.includes(segment));
  }

  async proxyRequest(req: Request, res: Response, path: string): Promise<any> {
    const service = this.findService(path);
    if (!service) {
      throw new ServiceUnavailableException(`No service found for path: ${path}`);
    }

    const targetUrl = `${service.baseUrl}/${path}`;
    const headers: Record<string, string> = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'x-user-id': (req as any).userId || '',
      'x-request-id': (req as any).requestId || '',
      'x-platform': (req.headers['x-platform'] as string) || '',
      'x-device-id': (req.headers['x-device-id'] as string) || '',
    };

    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method as any,
          url: targetUrl,
          data: req.body,
          params: req.query,
          headers,
          timeout: 15000,
        }),
      );
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
        requestId: (req as any).requestId || '',
      };
    } catch (error: any) {
      this.logger.error(`Proxy error for ${service.name}: ${error.message}`);
      if (error.response) {
        return {
          success: false,
          data: error.response.data,
          timestamp: new Date().toISOString(),
          requestId: (req as any).requestId || '',
        };
      }
      throw new ServiceUnavailableException(`Service ${service.name} is unavailable`);
    }
  }
}
