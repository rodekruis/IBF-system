import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { RedcrossBranchController } from './redcross-branch.controller';
import { RedcrossBranchEntity } from './redcross-branch.entity';
import { RedcrossBranchService } from './redcross-branch.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    TypeOrmModule.forFeature([RedcrossBranchEntity]),
  ],
  providers: [RedcrossBranchService],
  controllers: [RedcrossBranchController],
  exports: [RedcrossBranchService],
})
export class RedcrossBranchModule {}
