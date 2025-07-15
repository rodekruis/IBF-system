import { HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

import { NextFunction, Request, Response } from 'express';

import {
  DEV,
  WHATSAPP_INCOMING_API_URL,
  WHATSAPP_STATUS_API_URL,
} from '../../../config';
import { twilio } from './twilio.client';

@Injectable()
export class AuthMiddlewareTwilio implements NestMiddleware {
  private logger = new Logger('AuthMiddlewareTwilio');

  public constructor() {}

  public async use(req: Request, res: Response, next: NextFunction) {
    const twilioSignature = req.headers['x-twilio-signature'];

    if (DEV) {
      this.logger.debug(
        'AuthMiddlewareTwilio: Skipped request validation in DEV env for:',
        req.path,
      );
      return next();
    }

    const validWhatsAppStatus = twilio.validateRequest(
      process.env.TWILIO_AUTHTOKEN,
      twilioSignature,
      WHATSAPP_STATUS_API_URL,
      req.body,
      { accountSid: process.env.TWILIO_SID },
    );
    if (validWhatsAppStatus) {
      return next();
    }

    const validWhatsAppIncoming = twilio.validateRequest(
      process.env.TWILIO_AUTHTOKEN,
      twilioSignature,
      WHATSAPP_INCOMING_API_URL,
      req.body,
      { accountSid: process.env.TWILIO_SID },
    );
    if (validWhatsAppIncoming) {
      return next();
    }

    throw new HttpException(
      'Failed to validate Twilio request',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
