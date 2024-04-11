
const nodemailer = require('nodemailer');


const sendEmail = (email, name, message, attachments) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.elasticemail.com',
        port: 2525,
        auth: {
            user: '1311074.ds@gmail.com',
            pass: '690FEF04746242D3771E6901AEB9F0ADC1D7' // Replace with your actual API key
        }
    });

    let mailOptions = {
        from: email,
        to: '1311074.ds@gmail.com',
        subject: `Message from ${name}`,
        text: message,
        attachments: attachments // Attachments array
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};


module.exports = sendEmail;
