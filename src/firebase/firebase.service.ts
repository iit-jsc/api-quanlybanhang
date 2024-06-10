import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: admin.app.App,
  ) {}

  //   async sendOtp(phoneNumber: string): Promise<string> {
  //     const recaptchaVerifier = new admin.auth.RecaptchaVerifier(
  //       'recaptcha-container',
  //     );

  //     const verificationId = await admin
  //       .auth()
  //       .signInWithPhoneNumber(phoneNumber, recaptchaVerifier);
  //     return verificationId;
  //   }
}
