import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './auth';
import { SupabaseAuthGuard } from './auth.guard';
import { ApiKeyGuard } from './api-key.guard';

@Global()
@Module({
  providers: [SupabaseService, SupabaseAuthGuard, ApiKeyGuard],
  exports: [SupabaseService, SupabaseAuthGuard, ApiKeyGuard],
})
export class AuthModule {}
