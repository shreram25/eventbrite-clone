import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  async onModuleInit() {
    // Use env creds if provided, otherwise create Ethereal test account
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.logger.log(`Ethereal test account: ${testAccount.user}`);
    }
  }

  async sendTicketConfirmation(to: string, eventTitle: string, ticketCode: string) {
    const info = await this.transporter.sendMail({
      from: '"EventHub" <noreply@eventhub.com>',
      to,
      subject: `Your ticket for ${eventTitle}`,
      html: `
        <h2>Ticket Confirmed!</h2>
        <p>You're registered for <strong>${eventTitle}</strong></p>
        <p>Your ticket code: <strong>${ticketCode}</strong></p>
        <p>See you there!</p>
      `,
    });
    this.logger.log(`Email preview: ${nodemailer.getTestMessageUrl(info)}`);
  }

  async sendEventReminder(to: string, eventTitle: string, startDate: Date) {
    const info = await this.transporter.sendMail({
      from: '"EventHub" <noreply@eventhub.com>',
      to,
      subject: `Reminder: ${eventTitle} is coming up!`,
      html: `
        <h2>Event Reminder</h2>
        <p><strong>${eventTitle}</strong> starts on ${startDate.toLocaleString()}</p>
        <p>Don't forget to attend!</p>
      `,
    });
    this.logger.log(`Reminder email preview: ${nodemailer.getTestMessageUrl(info)}`);
  }
}
