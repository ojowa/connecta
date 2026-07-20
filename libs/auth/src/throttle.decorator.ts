import { SetMetadata } from '@nestjs/common';
import { ThrottleConfig } from './throttler.guard';

export const THROTTLE_KEY = 'throttle';
export const Throttle = (config: ThrottleConfig) => SetMetadata(THROTTLE_KEY, config);
