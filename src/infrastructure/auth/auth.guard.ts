import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from './auth';

/**
 * Guard that verifies Supabase JWT tokens.
 * Extracts the Bearer token from Authorization header,
 * validates it via Supabase, and attaches the user to the request.
 *
 * Usage:
 *   @UseGuards(SupabaseAuthGuard)
 *   @Get('profile')
 *   getProfile(@Req() req) { return req.user; }
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación requerido');
    }

    const token = authHeader.substring(7);
    const user = await this.supabaseService.getUser(token);

    if (!user) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    request.user = user;
    return true;
  }
}
