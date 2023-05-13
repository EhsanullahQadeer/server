// This is the fake account only for rthe testing

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "ervin61@ethereal.email",
    pass: "aE5n1N2skQStrZGNBQ",
  },
});

export default transporter;
