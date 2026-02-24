import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator to extract the authenticated Supabase user from request.
 * Must be used with SupabaseAuthGuard.
 *
 * Usage:
 *   @UseGuards(SupabaseAuthGuard)
 *   @Get('me')
 *   getMe(@CurrentUser() user) { return user; }
 *
 *   // Extract specific property:
 *   @Get('me')
 *   getMe(@CurrentUser('id') userId: string) { return userId; }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
