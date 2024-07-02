import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

const firebaseProvider = {
  provide: 'FIREBASE_APP',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const firebaseConfig = {
      type: 'service_account',
      project_id: 'iit-quanlybanhang',
      private_key_id: '267fabcfcac8daeffdda117606ad053c44f1223a',
      private_key:
        '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC+v8xNoprzKSTg\nXBLcCZjmhfWunvocw7zISrpdiII71GNsw2tceQepI73QjOKb1yMuR0wTDQik/JgP\nYHHMs6+ljOo3Ahx99ejlP6Md4jR5ODxjt8LInLXgTE/apmjsC8VqkIZ3PL2T2fD7\nrI8uH5tVlNHhlLoAM6hwYIByiYAW08YeTCIoEuJ5RaNixatWyCtgmaEOc1IIV4aq\n705d/PYIo1LtVyULQt/5hkxHR93nsxXktVkJyqTCE3plbQn3Y+mn5RyB7gL0kT2f\nOLYbnYF1W4B1KsqHNq+gyzsGlPsYNBa3VC5WkUx16pts+B+EU/k6FI/TASuyZ5YS\nJ1z/TmQ7AgMBAAECggEAA+r3MYPKVAfG2R+hKf9bPDoc6t19g++7bUqnVDMYRWGM\n/xUf1trHEqg0lVKwsrC6cxoyGAsAQmAutw8PhNldf9H70YtryZ/CFujdKdKBqntp\nwEaTkzu6TnGd4824Rm8I/7G22e/1NmaXVCQAgNsE3/ofErA2Bmrh0kAleWYBcKfI\niAiNHVQSmmiI7xvREpR2mpoAbf0/Vwx1tcs6ZGxYVULsAifFnKSVzjKNr9KwVimk\nlOtb3BMxMAhkGsFjdvN3u20VkSd8ZFaI9zpc+PHMqQmc3fTQnrIpgIvGHwyXVm6P\nE+Di1ptAL6CMq/UDRuUbwXBgRFq1lTqH8rRTaryQQQKBgQDxiQf3psIvpjVt+jdg\nmzcuc8sCytJsp+cBjzYLjgpuHck4iT1X6dc/M6gqr8ChvPg4VPcaqJrkU3kp8yEp\nNJf3ilQnjxpDrvvhUk7utP/O8E0K4ogkH6iTpVjFfdpuvnf+AAOe39VxgQj+Bv8d\nQRXIbhdHsoqNllPKbVT1jwZ0GwKBgQDKLCrjNazCgOSXfkT20O0AUkOPTM3VXBa6\nBLztRG7Lqvmx91u4xnnOcYE6K72RS18/CF+4oNRIVyEr2Fhb4D5v7xgiRNvZsl3x\n8iI5lVeB6HDNOfQv6VwCgmjO99ISaPgRZ+2DwR8+OccQa7k5WGWcNElhnl5YQF2n\nrxGjdz+SYQKBgBfMEX3j7zP0o0T/px8ci9ZG0FSpGQxdipQLwR5oUzzAMIgidWnI\n/00Z0NLL2CXXUXlzXZlBzWj7lG9+peDCbsqT1XDEV6kdf3GWw3IfYSjJYj3VTeaJ\nO/m4C8QBf1jz6SycYb7wfL4fIXytwcrnE7dYqXCF9cK3ce/6z6kV+2PLAoGBAMoS\nG0u9+k7uRYylyIhpinknwB8axSDcSlrjIXKFU7h9y9T1R9gHiPeuu1tJHNB8ZVa7\nJ/GBzqv/akhIlQg/uihm8dhOuu98OCn7ufmUK0LM8PIvWsIInM5lShyT1oRQJqI/\nHkbyYCfx1+WxxhBrKiRWnoHTqLjMnM9dTGP2bLQBAoGBAJi5tdx8QFcKDGRjTswm\nrMqPEt4xgKYTIW6kFeL1ujnsk1B4NiRE8ThCqeOAqrlLfcH9c/mn9jKoNqoHnOJg\nVZNiZHFVgGHbvvaBbrxdw6CI/Qyq3+Oo0BfenPPXYsAfTBML9h6xRkIYN/87dtH/\nYD71TlTsGtet3MoKmzBLJwYI\n-----END PRIVATE KEY-----\n',
      client_email:
        'firebase-adminsdk-6o3d8@iit-quanlybanhang.iam.gserviceaccount.com',
      client_id: '113854006438590940230',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url:
        'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-6o3d8%40iit-quanlybanhang.iam.gserviceaccount.com',
      universe_domain: 'googleapis.com',
    } as admin.ServiceAccount;

    // return admin.initializeApp({
    //   credential: admin.credential.cert(firebaseConfig),
    //   databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    //   storageBucket: `${firebaseConfig.projectId}.appspot.com`,
    // });
  },
};

@Module({
  controllers: [FirebaseController],
  providers: [firebaseProvider, FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
