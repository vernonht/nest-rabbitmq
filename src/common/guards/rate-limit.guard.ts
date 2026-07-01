import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const ip =
      ((req.ips as string[])?.length
        ? (req.ips as string[])[0]
        : (req.ip as string)) || 'unknown';
    return Promise.resolve(ip);
  }
}
