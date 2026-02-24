import { createClient } from '@supabase/supabase-js';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Supabase client wrapper for NestJS.
 * Used for verifying JWT tokens and managing auth state.
 */
@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly supabase;

  constructor(private readonly config: ConfigService) {
    const supabaseUrl = this.config.get<string>('SUPABASE_URL', 'http://localhost:8000');
    const serviceRoleKey = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY', '');

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log('✅ Supabase Auth configurado correctamente.');
  }

  /**
   * Verify a JWT token and return the user.
   */
  async getUser(token: string) {
    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    if (error) {
      this.logger.warn(`❌ Token inválido: ${error.message}`);
      return null;
    }
    return user;
  }

  get client() {
    return this.supabase;
  }
}

