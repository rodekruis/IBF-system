import { ApiProperty } from '@nestjs/swagger';

export class DeleteAdminAreasDto {
  @ApiProperty({
    description: 'Array of place codes to delete',
    example: ['UG123', 'UG456'],
  })
  placeCodes: string[];
}
