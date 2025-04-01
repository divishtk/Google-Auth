import nodemailer from "nodemailer";

const sendMailVerification = async (email, token) => {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASS,
    },
  });



  const verificationUrl = `${process.env.BASE_URL}/api/v1/users/verify/${token}`;

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: "Email Verification",
    text: `Thanks for register!! Please verify your email by clicking on the following link: ${verificationUrl}
        This link will expire in 10 hours.
        `,
  };

  try {
    await transport.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email", error);
  }
};

export default sendMailVerification;
