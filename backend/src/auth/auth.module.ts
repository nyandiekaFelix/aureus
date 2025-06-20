import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { FirebaseStrategy } from './strategies/firebase.strategy';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [PassportModule],
  providers: [
    FirebaseStrategy,
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
  exports: [FirebaseStrategy],
})
export class AuthModule {}


