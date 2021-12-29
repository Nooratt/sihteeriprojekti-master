/**
 * Contains the url (express GET route) for user verification page. Used in the email send to a new registered user.
 * @type {string}
 */
var url = "http://localhost:63342/verify";

/**
 * A Node module handling email traffic from server.
 */
var nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {

        user: 'info.moiccu@gmail.com',
        pass:'moiccu2019'
    }
});

/**
 * A function to send a registration verification email to a newly registered user
 * @author Noora Turunen
 * @param to: A String containing an email address
 */
function registryMail(to){
    /**
     * A keyed list containing registration email content
     * @type {{subject: string, from: string, html: string, to: *}}
     */
    var mailOptions = {
        from: 'info.moiccu@gmail.com',
        to: to,
        subject: 'Finish your Moiccu. registration',
        html: '<h1>Moiccu.</h1>' +
            '<p>It looks like you have heard of the Moiccu.' +
            'Now you just need to verify your account at <a href="' + url + '">this link</a>.</p>' +
            '<p>If you did not register for the Moiccu. website, you can ignore this email.<3</p>'

    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


module.exports.registryMail = registryMail;