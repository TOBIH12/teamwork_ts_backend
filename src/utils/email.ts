import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

type EmailOptions = {
  from?: string | undefined;
  to: string;
  subject: string;
  html?: string;
};

type MailContentTemplate = {
  content: string;
  buttonUrl: string;
  buttonText: string;
};

export const sendEmail = async (option: EmailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const emailOptions: EmailOptions = {
      from: 'Teamwork Support <support@teamwork.com>',
      to: option.to,
      subject: option.subject,
      html: option.html,
    };

    await transporter.sendMail(emailOptions);
  } catch (error: unknown) {
    console.log('error:', error);
    throw new Error(`Failed to send email: ${error}`);
  }
};

export const emailTemplate = (template: MailContentTemplate) => {
  return `<!DOCTYPE html>
  <html>
  <body style="text-align: center; font-family: 'Verdana', serif; color: #000;">
    <div
      style="
        max-width: 400px;
        margin: 10px;
        background-color: #fafafa;
        padding: 25px;
        border-radius: 20px;
      "
    >
      <p style="text-align: left;">
        ${template.content}
      </p>
      <a href="${template.buttonUrl}" target="_blank">
        <button
          style="
            background-color: #43944a;
            border: 0;
            width: 200px;
            height: 30px;
            border-radius: 6px;
            color: #fff;
          "
        >
          ${template.buttonText}
        </button>
      </a>
      <p style="text-align: left;">
        If you are unable to click the above button, copy paste the below URL into your address bar
      </p>
      <a href="${template.buttonUrl}" target="_blank">
          <p style="margin: 0px; text-align: left; font-size: 10px; text-decoration: none;">
            ${template.buttonUrl}
          </p>
      </a>
    </div>
  </body>
</html>`;
};
