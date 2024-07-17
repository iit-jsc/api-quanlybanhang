import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class TransporterService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOTP(email: string, otp: string) {
    if (!email) return null;

    await this.mailerService
      .sendMail({
        to: email,
        from: process.env.EMAIL_ID,
        subject: "Xác minh tài khoản của bạn",
        html: "<span>Đây là mã xác minh của bạn: </span>" + `<strong>${otp}</strong>`,
      })
      .then((success) => {
        console.log("!11");

        console.log(success);
      })
      .catch((err) => {
        console.log("!22");
        console.log(err);
      });
  }
}
