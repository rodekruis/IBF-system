import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

export enum TwilioStatus {
  delivered = 'delivered',
  read = 'read',
  undelivered = 'undelivered',
  failed = 'failed',
}

export class TwilioStatusCallbackDto {
  @ApiProperty({ example: 'SMb677b6846ec347cf80b8a5fd948efb53' })
  @IsString()
  public MessageSid: string;

  @ApiProperty({ example: TwilioStatus.delivered })
  @IsString()
  public MessageStatus: TwilioStatus;

  @ApiProperty({ example: 'Twilio Error: []' })
  @IsString()
  @IsOptional()
  public ErrorMessage: string;

  @ApiProperty({ example: '63015' })
  @IsString()
  @IsOptional()
  public ErrorCode: string;

  public SmsSid: string;

  public To: string;
}

export class TwilioIncomingCallbackDto {
  @ApiProperty({ example: 'SMb677b6846ec347cf80b8a5fd948efb53' })
  @IsString()
  @IsOptional()
  public MessageSid: string;

  @ApiProperty({ example: 'whatsapp:+31600000000' })
  @IsString()
  public From: string;

  @ApiProperty({ example: '31600000000' })
  @IsString()
  @IsOptional()
  public WaId: string;

  @ApiProperty({
    example: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
  })
  @IsString()
  @IsOptional()
  public To: string;

  @ApiProperty({ example: 'Yes' })
  @IsString()
  @IsOptional()
  public Body: string;
}

export class SendTestWhatsappDto {
  @ApiProperty({ example: 'message' })
  message: string;

  @ApiProperty({ example: '+31600000000' })
  recipientPhoneNr: string;
}
