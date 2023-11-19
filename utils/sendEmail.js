import { createTransport } from "nodemailer";
export const sendEmail = async (email, subject, text) => {
    const transporter = createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        }
    })

    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject,
        text
    })
}