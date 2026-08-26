import { Controller, All, Req, Res, Next } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { GatewayProxyService } from './gateway-proxy.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Gateway')
@Controller()
export class GatewayProxyController {
  private readonly publicRoutes = new Set(['auth', 'content', 'support']);

  constructor(private readonly proxyService: GatewayProxyService) {}

  @All('*')
  @ApiOperation({ summary: 'Proxy all requests to backend services' })
  proxyAll(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = req.url.replace(/^\/?v1\//, '').replace(/^\/?/, '');
    const service = path.split('/')[0];
    if (!service || !this.proxyService.findService(path)) {
      return res.status(404).json({ statusCode: 404, message: `No service found for: ${path}` });
    }
    return this.proxyService
      .proxyRequest(req, res, path)
      .then((data) => res.json(data))
      .catch(next);
  }
}
