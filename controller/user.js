const {User} = require('../models/');
const bcryp = require('bcrypt');
const jwt = require('jsonwebtoken');
const {JWT_SECRET_KEY} = process.env;
const oauth2 = require('../utils/oauth2');
const nodemailer = require('../utils/nodemailer');

module.exports = {
    register: async (req, res) => {
        try {
            const {name, email, password} = req.body;

            const exist = await User.findOne({where: {email}});
            if (exist) {
                return res.status(400).json({
                    status: false,
                    message: 'email already used!',
                    data: null
                });
            }

            const hashPassword = await bcryp.hash(password, 10);

            const user = await User.create({
                name, email, password: hashPassword, user_type: 'basic'
            });

            return res.status(201).json({
                status: true,
                message: 'user created!',
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (error) {
            throw error;
        }
    },

    login: async (req, res) => {
        try {
            const {email, password} = req.body;

            const user = await User.findOne({where: {email}});
            if (!user) {
                return res.status(400).json({
                    status: false,
                    message: 'credential is not valid!',
                    data: null
                });
            }

            if (user.user_type == 'google' && !user.password) {
                return res.status(400).json({
                    status: false,
                    message: 'your accont is registered with google oauth, you need to login with google oauth2!',
                    data: null
                });
            }

            const passwordCorrect = await bcryp.compare(password, user.password);
            if (!passwordCorrect) {
                return res.status(400).json({
                    status: false,
                    message: 'credential is not valid!',
                    data: null
                });
            }

            const payload = {
                id: user.id,
                name: user.name,
                email: user.email
            };

            const token = await jwt.sign(payload, JWT_SECRET_KEY);
            return res.status(200).json({
                status: true,
                message: 'login success!',
                data: {
                    token: token
                }
            });

        } catch (error) {
            throw error;
        }
    },

    whoami: async (req, res) => {
        try {
            return res.status(200).json({
                status: true,
                message: 'fetch user success!',
                data: req.user
            });
        } catch (error) {
            throw error;
        }
    },

    googleOauth2: async (req, res) => {
        const {code} = req.query;
        if (!code) {
            const googleLoginUrl = oauth2.generateAuthUrl();
            return res.redirect(googleLoginUrl);
        }

        await oauth2.setCredentials(code);
        const {data} = await oauth2.getUserData();

        let user = await User.findOne({where: {email: data.email}});
        if (!user) {
            user = await User.create({
                name: data.name,
                email: data.email,
                user_type: 'google'
            });
        }

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        const token = await jwt.sign(payload, JWT_SECRET_KEY);
        return res.status(200).json({
            status: true,
            message: 'login success!',
            data: {
                token: token
            }
        });
    },
    forgotPassword: async (req, res) => {
        const {email} = req.body;

        const user = await User.findOne({where: {email}});
        if (user) {
            const payload = {
                id: user.id
            };
            const token = await jwt.sign(payload, JWT_SECRET_KEY);
            const url = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;

            const html = await nodemailer.getHtml('resetpassword.ejs', {name: user.name, url});
            nodemailer.sendMail(user.email, 'Reset passwor request', html);
        }

        return res.status(200).json({
            status: true,
            message: 'we will send a email if the email is registered!',
            data: null
        });
    },

    resetPasswordPage: (req, res) => {
        const {token} = req.query;
        return res.render('auth/reset-password', {message: null, token});
    },

    resetPassword: async (req, res) => {
        try {
            const {new_password, confirm_new_password} = req.body;

            const {token} = req.query;
            if (!token) {
                return res.render('auth/reset-password', {message: 'invalid token!', token});
            }
            if (new_password != confirm_new_password) {
                return res.render('auth/reset-password', {message: 'confirm password does not match!', token});
            }

            const data = await jwt.verify(token, JWT_SECRET_KEY);

            const hashPassword = await bcryp.hash(new_password, 10);
            const updated = await User.update({password: hashPassword}, {where: {id: data.id}});
            if (updated[0] == 0) {
                return res.render('auth/reset-password', {message: `reset password failed!`, token});
            }

            return res.send('success');
        } catch (err) {
            throw err;
        }
    }
};