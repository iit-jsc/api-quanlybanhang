import { Controller, Inject } from '@nestjs/common';

import { app } from 'firebase-admin';
@Controller('firebase')
export class FirebaseController {
  // #db: FirebaseFirestore.Firestore;
  // #collection: FirebaseFirestore.CollectionReference;
  // constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
  //   this.#db = firebaseApp.firestore();
  // }
}
