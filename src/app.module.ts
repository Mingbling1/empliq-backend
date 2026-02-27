import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CompaniesModule } from './infrastructure/http/modules/companies.module';
import { PositionsModule } from './infrastructure/http/modules/positions.module';
import { SalariesModule } from './infrastructure/http/modules/salaries.module';
import { ReviewsModule } from './infrastructure/http/modules/reviews.module';
import { BenefitsModule } from './infrastructure/http/modules/benefits.module';
import { ProfilesModule } from './infrastructure/http/modules/profiles.module';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { StorageModule } from './infrastructure/storage';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    StorageModule,
    AuthModule,
    CompaniesModule,
    PositionsModule,
    SalariesModule,
    ReviewsModule,
    BenefitsModule,
    ProfilesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
