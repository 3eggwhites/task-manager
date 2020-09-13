const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const welcomeMail = (email,name) => {
    sgMail.send({
        to: email,
        from: 'taskapp@lazydeveloper.dev',
        subject: 'Thanks fo signing up!',
        text: `Welcome ${name} to the task manager app.`
    });
}

const goodByeMail = (email,name) => {
    sgMail.send({
        to: email,
        from: 'taskapp@lazydeveloper.dev',
        subject: 'Sorry to see you go! :(',
        text: `Dear ${name} we are sorry to see you go. We hope you enjoyed using our application.`
    });
}

module.exports = {
    welcomeMail,
    goodByeMail
};