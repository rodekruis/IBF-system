import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { CountryEntity } from '../country/country.entity';
import { WhatsappModule } from '../notification/whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, CountryEntity]),
    WhatsappModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
