import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private adminApp: admin.app.App;

  constructor() {
    this.adminApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }

  async verifyIdToken(idToken: string) {
    try {
      const decodedToken = await this.adminApp
        .auth()
        .verifyIdToken(idToken, true);

      return { success: true, uid: decodedToken.uid };
    } catch (error) {
      console.log(error);
      return { success: false, error: error.message };
    }
  }
}
