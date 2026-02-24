import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './auth';
import { SupabaseAuthGuard } from './auth.guard';

@Global()
@Module({
  providers: [SupabaseService, SupabaseAuthGuard],
  exports: [SupabaseService, SupabaseAuthGuard],
})
export class AuthModule {}
