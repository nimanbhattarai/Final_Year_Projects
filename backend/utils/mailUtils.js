const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const { config } = require("dotenv");
config();

// Generate random 8-digit password
function generateRandomPassword(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    return password;
}

// Send email with nodemailer
async function sendPasswordEmail(toEmail, password) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 465,
        host: 'smtp.gmail.com',
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: 'scholarlybvdu@gmail.com',
        to: toEmail,
        subject: 'Your Scholarly Account Password',
        html: `<p>Hello,</p>
           <p>Your account has been created. Your temporary password is:</p>
           <h2>${password}</h2>
           <p>Please log in and reset your password immediately.</p>
           <p>Regards,<br/>College Admin</p>`
    };

    const response = await transporter.sendMail(mailOptions);
    console.log(response);
    if (!response.accepted) {
        return {
            valid: false
        };
    } else {
        return {
            valid: true
        }
    }
}

// const password = generateRandomPassword();

// setTimeout(() => {
//     sendPasswordEmail('nimanbhattarai1234@gmail.com', password);
// }, 4000);

async function retryEmailSending(toEmail, password){
   const interval =  setTimeout(async () => {
        await sendPasswordEmail(toEmail, password);
    }, 10000);

    return () => {
        clearInterval(interval);
    }
}

module.exports = {
    generateRandomPassword,
    sendPasswordEmail,
    retryEmailSending
}