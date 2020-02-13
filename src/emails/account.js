const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'mrinalmni@gmail.com',
        subject: 'Welcome to the Task Manager App',
        text: `Welcome to the app, ${name}. Thanks for signing up`
    }) // This returns a promise
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'mrinalmni@gmail.com',
        subject: 'Goodbye!',
        text: `Sorry ${name} to let you go`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}
