import nodemailer from "nodemailer"


export const sendEmail = async options => {

    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:25,
        auth: {
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    });
    const mailOptions = {
        from: 'Gran-k <slwoyjkee@gmail.com>',
        to:options.email,
        subject: options.subject,
        text:options.message,
        //html
    };
   await transporter.sendMail(mailOptions);
};

