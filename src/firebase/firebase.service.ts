import * as admin from "firebase-admin";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
@Injectable()
export class FirebaseService {
  constructor(protected readonly prisma: PrismaService,) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }

  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return await admin.auth().verifyIdToken(token);
  }

  async getToken(userId: string): Promise<string> {
    return await admin.auth().createCustomToken(userId);
  }

  async sendNotificationToBranch(branchId: string, accountId: string) {
    const firebaseTokens = await this.getTokensByBranchId(branchId, accountId);

    if (firebaseTokens.length === 0) {
      return;
    }

    const message = {
      notification: {
        title: "Có thông báo mới!",
        body: `Bạn nhận được thông tin đơn hàng mới.`,
      },
      tokens: firebaseTokens,
    };

    admin.messaging().sendMulticast(message)
      .then((response) => {
        console.log(`${response.successCount} thông báo đã được gửi thành công.`);
      })
      .catch((error) => {
        console.error("Lỗi khi gửi thông báo:", error);
      });
  }

  async getTokensByBranchId(branchId: string, accountId: string): Promise<string[]> {
    const authTokens = await this.prisma.authToken.findMany({
      where: {
        account: {
          ...(accountId && {
            id: {
              not: accountId,
            },
          }),
          OR: [
            {
              user: {
                branchId,
              }
            },
            {
              branches: {
                some: {
                  id: branchId,
                },
              }
            }],
        },
        firebaseToken: {
          not: null
        }
      },
      select: { firebaseToken: true },
    })

    return authTokens.map((authToken) => authToken.firebaseToken);
  }
}
