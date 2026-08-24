import { Controller, All, Req, Res, Next, UseGuards } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { GatewayProxyService } from './gateway-proxy.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Gateway')
@Controller()
export class GatewayProxyController {
  constructor(private readonly proxyService: GatewayProxyService) {}

  @All('auth/*')
  @ApiOperation({ summary: 'Proxy to Auth Service' })
  proxyAuth(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = req.url.replace(/^\/?v1\//, '').replace(/^\/?/, '');
    return this.proxyService.proxyRequest(req, res, `auth/${path}`).then((data) => res.json(data)).catch(next);
  }

  @All('users/*')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy to Users Service' })
  proxyUsers(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = req.url.replace(/^\/?v1\//, '').replace(/^\/?/, '');
    return this.proxyService.proxyRequest(req, res, `users/${path}`).then((data) => res.json(data)).catch(next);
  }

  @All('matching/*')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy to Matching Service' })
  proxyMatching(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = req.url.replace(/^\/?v1\//, '').replace(/^\/?/, '');
    return this.proxyService.proxyRequest(req, res, `matching/${path}`).then((data) => res.json(data)).catch(next);
  }

  @All('chat/*')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy to Chat Service' })
  proxyChat(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = req.url.replace(/^\/?v1\//, '').replace(/^\/?/, '');
    return this.proxyService.proxyRequest(req, res, `chat/${path}`).then((data) => res.json(data)).catch(next);
  }

  @All('calls/*')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy to Calls Service' })
  proxyCalls(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = req.url.replace(/^\/?v1\//, '').replace(/^\/?/, '');
    return this.proxyService.proxyRequest(req, res, `calls/${path}`).then((data) => res.json(data)).catch(next);
  }

  @All('media/*')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy to Media Service' })
  proxyMedia(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = req.url.replace(/^\/?v1\//, '').replace(/^\/?/, '');
    return this.proxyService.proxyRequest(req, res, `media/${path}`).then((data) => res.json(data)).catch(next);
  }

  @All('payments/*')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy to Payments Service' })
  proxyPayments(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = req.url.replace(/^\/?v1\//, '').replace(/^\/?/, '');
    return this.proxyService.proxyRequest(req, res, `payments/${path}`).then((data) => res.json(data)).catch(next);
  }

  @All('notifications/*')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy to Notifications Service' })
  proxyNotifications(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = req.url.replace(/^\/?v1\//, '').replace(/^\/?/, '');
    return this.proxyService.proxyRequest(req, res, `notifications/${path}`).then((data) => res.json(data)).catch(next);
  }

  @All('search/*')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy to Search Service' })
  proxySearch(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = req.url.replace(/^\/?v1\//, '').replace(/^\/?/, '');
    return this.proxyService.proxyRequest(req, res, `search/${path}`).then((data) => res.json(data)).catch(next);
  }

  @All('content/*')
  @ApiOperation({ summary: 'Proxy to Content Service' })
  proxyContent(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = req.url.replace(/^\/?v1\//, '').replace(/^\/?/, '');
    return this.proxyService.proxyRequest(req, res, `content/${path}`).then((data) => res.json(data)).catch(next);
  }

  @All('support/*')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Proxy to Support Service' })
  proxySupport(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = req.url.replace(/^\/?v1\//, '').replace(/^\/?/, '');
    return this.proxyService.proxyRequest(req, res, `support/${path}`).then((data) => res.json(data)).catch(next);
  }

  @All('admin/*')
  @ApiOperation({ summary: 'Proxy to Admin Service' })
  proxyAdmin(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = req.url.replace(/^\/?v1\//, '').replace(/^\/?/, '');
    return this.proxyService.proxyRequest(req, res, `admin/${path}`).then((data) => res.json(data)).catch(next);
  }
}
