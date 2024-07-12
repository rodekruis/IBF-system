import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { twilioClient } from '../whatsapp/twilio.client';

@Injectable()
export class LookupService {
  public constructor() {}

  public async lookupAndCorrect(phoneNumber: string): Promise<string> {
    try {
      const updatedPhone = this.sanitizePhoneNrExtra(phoneNumber);

      const lookupResponse = await twilioClient.lookups
        .phoneNumbers(updatedPhone)
        .fetch({ type: ['carrier'] });
      return lookupResponse.phoneNumber.replace(/\D/g, '');
    } catch (e) {
      console.log('e: ', e);
      const errors = `Provided whatsappNumber is not a valid phone number`;
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
  }

  private sanitizePhoneNrExtra(phoneNumber: string): string {
    const sanitizedPhoneNr =
      phoneNumber.substr(0, 2) == '00'
        ? phoneNumber.substr(2, phoneNumber.length - 2)
        : phoneNumber.substr(0, 3) == '+00'
        ? phoneNumber.substr(3, phoneNumber.length - 3)
        : phoneNumber.substr(0, 2) == '+0'
        ? phoneNumber.substr(2, phoneNumber.length - 2)
        : phoneNumber.substr(0, 1) == '+'
        ? phoneNumber.substr(1, phoneNumber.length - 1)
        : phoneNumber;
    return `+${sanitizedPhoneNr}`;
  }
}
