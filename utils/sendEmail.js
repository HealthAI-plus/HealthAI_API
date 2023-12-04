
const {ORGANISATION_EMAIL_ADDRESS} = require('../config')
const {transporter} = require('../config/nodemailer')

async function sendVerificationEmail(email, verificationLink) {
    return new Promise((resolve, reject) => {
        transporter.sendMail({
            from: ORGANISATION_EMAIL_ADDRESS,
            to: email,
            "content-type": "text/html",
            subject: `Email Verification`,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap" rel="stylesheet">
                <style>
                    body * {
                        font: .9rem 'Poppins', sans-serif;
                    }
                    #main {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
            
                    }
                    h2 {
                        font-size: 1.2rem;
                        margin: 15px 0;
                        font-weight: 500;
                    }
                    p {
                        margin: 0;
                    }
                    p#p1 {
                        margin-bottom: 10px;
                    }
                    strong {
                        font-weight: 500;
                    }
                    a#a1 {
                        background-color: #59c4d0;
                        padding: 8px 45px;
                        color: #fff;
                        border-radius: 5px;
                        margin: 30px 0 50px 0;
                    }
                </style>
            </head>
            <body>
            <div id="main"> 
                <h2>Verify your email addresss</h2>
                <p id="p1">You've entered <strong>${email}</strong>  as the email address for your account. </p>
                <p>Please verify this email address by clicking button below.</p>
                <a id="a1" href="${verificationLink}"> Verify </a> 
            
                <p>Or Copy and paste the url in your browser</p>
                <a href="" style="width: 80%;">${verificationLink}</a>
            </div>
            </body>
            </html>
            `
        }, (err, info) => {
            if (err) reject(err)
            else resolve(info)
            // if info resolve(info)
        })
    })
    
}

async function sendPasswordResetLink(email, passwordResetLink) {
    return new Promise((resolve, reject) => {
        transporter.sendMail({
            from: ORGANISATION_EMAIL_ADDRESS,
            to: email,
            subject: `Reset Password`,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap" rel="stylesheet">
                <style>
                    body * {
                        font: .9rem 'Poppins', sans-serif;
                    }
                    #main {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
            
                    }
                    h2 {
                        font-size: 1.2rem;
                        margin: 15px 0;
                        font-weight: 500;
                    }
                    p {
                        margin: 0;
                    }
                    p#p1 {
                        margin-bottom: 10px;
                    }
                    strong {
                        font-weight: 500;
                    }
                    a#a1 {
                        background-color: #59c4d0;
                        padding: 8px 45px;
                        color: #fff;
                        border-radius: 5px;
                        margin: 30px 0 50px 0;
                    }
                </style>
            </head>
            <body>
            <div id="main"> 
                <h2>Reset your password</h2>
                <p id="p1"> A request was sent for a password reset link </p>
                <p>Reset your password by clicking button below.</p>
                <a id="a1" href="${passwordResetLink}"> Reset </a> 
            
                <p>Or Copy and paste the url in your browser</p>
                <a href="" style="width: 80%;">${passwordResetLink}</a>
            </div>
            </body>
            </html>
            `
        }, (err, info) => {
            if (err) reject(err)
            else resolve(info)
            // if info resolve(info)
        })
    })
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetLink
}