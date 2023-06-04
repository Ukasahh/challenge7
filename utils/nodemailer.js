const nodemailer = require('nodemailer');
const ejs = require('ejs');
const {response} = require('express');
const {google} = require('googleapis');

const {
    GOOGLE_CLIENT_ID,
    GOOGLE_SECRET_KEY,
    GOOGLE_REFRESH_TOKEN,
    GOOGLE_SENDER_EMAIL,
    GOOGLE_REDIRECT_URI
} = process.env;

const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_SECRET_KEY,
    GOOGLE_REDIRECT_URI
);

// set credential
oauth2Client.setCredentials({refresh_token: GOOGLE_REFRESH_TOKEN});

module.exports = {
    sendMail: async (to, subject, html) => {
        const accessToken = await oauth2Client.getAccessToken();
        console.log({GOOGLE_REFRESH_TOKEN});
        console.log({accessToken});

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: GOOGLE_SENDER_EMAIL,
                clientId: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_SECRET_KEY,
                refreshToken: GOOGLE_REFRESH_TOKEN,
                accessToken: accessToken
            }
        });

        transport.sendMail({to, subject, html});
    },

    getHtml: (fileName, data) => {
        return new Promise((resolve, reject) => {
            const path = `${__dirname}/../views/emailtemplate/${fileName}`;

            ejs.renderFile(path, data, (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        });
    }
};