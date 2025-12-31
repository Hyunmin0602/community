import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

export async function sendVerificationEmail(email: string, code: string) {
    // Development fallback: Log OTP to console if SMTP is not configured
    if (!process.env.EMAIL_SERVER_HOST) {
        console.log(`[DEV MODE] Verification Code for ${email}: ${code}`);
        return;
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Pixelit Auth" <noreply@pixelit.com>',
            to: email,
            subject: '[Pixelit] 회원가입 인증 코드',
            text: `인증 코드: ${code}\n\n이 코드는 5분간 유효합니다.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">Pixelit 회원가입 인증</h2>
                    <p>안녕하세요,</p>
                    <p>Pixelit 커뮤니티 가입을 위한 인증 코드입니다.</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0;">
                        ${code}
                    </div>
                    <p>이 코드는 5분간 유효합니다. 본인이 요청하지 않았다면 이 메일을 무시해주세요.</p>
                </div>
            `,
        });
    } catch (error) {
        console.error('Failed to send email:', error);
        // In production, you might want to throw this error
        // throwing allows the UI to show "Failed to send email"
        throw new Error('이메일 전송에 실패했습니다.');
    }
}
