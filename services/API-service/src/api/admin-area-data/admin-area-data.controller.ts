import {
    Controller,
    Get,
    Param,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { AdminAreaDataService } from './admin-area-data.service';

@ApiBearerAuth()
@UseGuards(RolesGuard)
@ApiTags('adminAreaData')
@Controller('adminAreaData')
export class AdminAreaDataController {
    private readonly adminAreaDataService: AdminAreaDataService;

    public constructor(adminAreaDataService: AdminAreaDataService) {
        this.adminAreaDataService = adminAreaDataService;
    }

    @UseGuards(RolesGuard)
    @ApiOperation({
        summary: 'Upload admin-area data',
    })
    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    public async upload(@UploadedFile() adminAreaData): Promise<void> {
        await this.adminAreaDataService.updateOrCreate(adminAreaData);
    }
}
