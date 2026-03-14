import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Guard that validates API key from X-API-Key header.
 * Used to protect admin/pipeline endpoints (bulk upsert, etc.)
 * that should only be accessible by internal services and scripts.
 *
 * The API key is read from the ADMIN_API_KEY environment variable.
 *
 * Usage:
 *   @UseGuards(ApiKeyGuard)
 *   @Post('bulk')
 *   bulkCreate(@Body() dto) { ... }
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const expectedKey = process.env.ADMIN_API_KEY;

    if (!expectedKey) {
      throw new UnauthorizedException(
        'ADMIN_API_KEY not configured on server',
      );
    }

    if (!apiKey || apiKey !== expectedKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}
