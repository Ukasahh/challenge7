const express = require('express');
const router = express.Router();
const user = require('../controller/user');
const product = require('../controller/product');
const supplier = require('../controller/supplier');
const component = require('../controller/component');
const media = require('../controller/media');
const middlewares = require('../utils/middlewares');
const nodemailer = require('../utils/nodemailer');
const storage = require('../utils/storage');
const multer = require('multer')();


router.get('/', (req, res) => {
    return res.status(200).json({
        message: 'HOMEPAGE'
    });
}); // get all channel

//MAILER
router.get('/test/mailer', async (req, res) => {
    try {
        // send email
        const html = await nodemailer.getHtml('welcome.ejs', {user: {name: 'Ukasah'}});
        nodemailer.sendMail('ukasahhayata@gmail.com', 'Hello', html);

        return res.status(200).json({
            status: true,
            message: 'success',
            data: null
        });
    } catch (error) {
        throw error;
    }
});

//MAILER FORGET PASSWORD
router.get('/reset-password', user.resetPasswordPage);
router.post('/auth/forgot-password', user.forgotPassword);
router.post('/auth/reset-password', user.resetPassword);

//ENDPOINT USER
router.post('/auth/register', user.register);
router.post('/auth/login', user.login);
router.get('/auth/oauth', user.googleOauth2);
router.get('/auth/whoami', middlewares.auth, user.whoami);

//ENDPOINT MEDIA
router.post('/storage/images', storage.image.single('media'), media.storageSingle);
router.post('/storage/multi/images', storage.image.array('media'), media.storageArray);
router.post('/imagekit/upload', multer.single('media'), media.imagekitUpload);

//ENDPOINT PRODUCT
router.get('/getproducts', product.index); // get all products
router.get('/products/:id', product.show); // get products by id
router.post('/products/store', product.store); // create data products
router.put('/products//update/:id', product.update); // update data products by id
router.delete('/products/destroy/:id', product.destroy); // hdelete data products by id

//ENDPOINT SUPPLIER
router.get('/suppliers', supplier.index); // get all suppliers
router.get('/suppliers/:id', supplier.show); // get supplier by id
router.post('/suppliers/store', supplier.store); // create data supplier
router.put('/suppliers/:id', supplier.update); // update data supplier by id
router.delete('/suppliers/:id', supplier.destroy); // hdelete data supplier by id

//ENDPOINT COMPONENT
router.get('/components', component.index); // get all components
router.get('/components/:id', component.show); // get component by id
router.post('/components/store', component.store); // create data component
router.put('/components/update/:id', component.update); // update data component by id
router.delete('/components/destroy/:id', component.destroy); // hdelete data component by id

module.exports = router;