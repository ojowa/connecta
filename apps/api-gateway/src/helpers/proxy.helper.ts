import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

const logger = new Logger('GatewayProxy');

export async function proxyGet(http: HttpService, url: string, req: Request, res: Response) {
  try {
    const result = await firstValueFrom(
      http.get(url, { params: req.query, headers: { authorization: req.headers.authorization } }),
    );
    return res.status(result.status).json(result.data);
  } catch (err) {
    return handleError(err, url, res);
  }
}

export async function proxyPost(
  http: HttpService,
  url: string,
  body: any,
  req: Request,
  res: Response,
) {
  try {
    const result = await firstValueFrom(
      http.post(url, body, { headers: { authorization: req.headers.authorization } }),
    );
    return res.status(result.status).json(result.data);
  } catch (err) {
    return handleError(err, url, res);
  }
}

export async function proxyPut(
  http: HttpService,
  url: string,
  body: any,
  req: Request,
  res: Response,
) {
  try {
    const result = await firstValueFrom(
      http.put(url, body, { headers: { authorization: req.headers.authorization } }),
    );
    return res.status(result.status).json(result.data);
  } catch (err) {
    return handleError(err, url, res);
  }
}

export async function proxyPatch(
  http: HttpService,
  url: string,
  body: any,
  req: Request,
  res: Response,
) {
  try {
    const result = await firstValueFrom(
      http.patch(url, body, { headers: { authorization: req.headers.authorization } }),
    );
    return res.status(result.status).json(result.data);
  } catch (err) {
    return handleError(err, url, res);
  }
}

export async function proxyDelete(http: HttpService, url: string, req: Request, res: Response) {
  try {
    const result = await firstValueFrom(
      http.delete(url, { headers: { authorization: req.headers.authorization } }),
    );
    return res.status(result.status).json(result.data);
  } catch (err) {
    return handleError(err, url, res);
  }
}

export function handleError(err: unknown, url: string, res: Response) {
  if (err instanceof AxiosError) {
    const status = err.response?.status || 502;
    const data = err.response?.data;
    logger.warn(`Proxy error ${status} for ${url}: ${err.message}`);
    return res.status(status).json(data || { statusCode: status, message: 'Service unavailable' });
  }
  logger.error(`Proxy failed for ${url}`, err);
  return res.status(502).json({ statusCode: 502, message: 'Service unavailable' });
}
