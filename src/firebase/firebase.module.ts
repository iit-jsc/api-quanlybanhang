import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';
import * as admin from 'firebase-admin';

@Module({
  controllers: [FirebaseController],
  providers: [
    FirebaseService,
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        const adminConfig = admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });
        return admin.initializeApp({
          credential: adminConfig,
          databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
      },
    },
  ],
})
export class FirebaseModule {}
