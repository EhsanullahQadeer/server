import nodemailer from "nodemailer";
// import nodemailerConfig from "./nodeMailerConfig.js"
// The files works for the actual account

const sendEmail = async ({ to, subject, html }) => {
  // let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    // host: 'smtp.ethereal.email',
    // port: 587,
    service: "gmail",
    auth: {
      // The Below are the testing user and the pass from the nodemailer
      // user: 'ervin61@ethereal.email',
      // pass: 'aE5n1N2skQStrZGNBQ'

      // The  below are the actual user and the pass The password is creted in my google gmail account settings for 2-step-verification
      user: "sardaralimuradali4@gmail.com",
      pass: "svoduwnpspitsuzj",
      //         pass: '2cesqxue'
    },
  });

  return transporter.sendMail({
    from: '"Sardar Ali Murad li', // sender address
    to,
    subject,
    html,
  });
};

export default sendEmail;
