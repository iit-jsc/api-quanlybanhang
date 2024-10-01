import * as admin from "firebase-admin";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { mapLimit } from 'async';
import { chunk } from 'lodash';
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

  async sendPushNotification(
    tokens: string[],
    title: string,
    body: string
  ): Promise<void> {
    try {
      const tokenChunks = chunk(tokens, 500);

      const batchResponses = await mapLimit(
        tokenChunks,
        Number(process.env.FIREBASE_PARALLEL_LIMIT) || 3,
        async (tokenGroup: string[]): Promise<admin.messaging.BatchResponse> => {
          const messagePayloads = tokenGroup.map((token) => ({
            token: token,
            notification: {
              title: title,
              body: body,
            },
            apns: {
              payload: {
                aps: {
                  'content-available': 1,
                },
              },
            },
          }));

          return await this.sendAll(messagePayloads);
        },
      );

      console.log(batchResponses[0].responses);


      batchResponses.forEach((batchResponse, idx) => {
        console.log(`Batch ${idx + 1}: Success - ${batchResponse.successCount}, Failures - ${batchResponse.failureCount}`);
      });
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }
  private async sendAll(messages: admin.messaging.TokenMessage[]): Promise<admin.messaging.BatchResponse> {
    try {
      return await admin.messaging().sendAll(messages);
    } catch (error) {
      return {
        responses: messages.map(() => ({
          success: false,
          error: error,
        })),
        successCount: 0,
        failureCount: messages.length,
      } as admin.messaging.BatchResponse;
    }
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
