const imageKit = require('../utils/imagekit')

module.exports = {
    storageSingle: (req, res) => {
            const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        
            return res.status(200).json({
                status: true,
                message: 'success!',
                data: {
                    image_url: imageUrl
                }
            });
    },

    storageArray: (req, res) => {
            const imageUrls = [];
            req.files.forEach(file => {
                imageUrls.push(`${req.protocol}://${req.get('host')}/images/${file.filename}`)
            });
            return res.status(200).json({
                status: true,
                message: 'success!',
                data: {
                    image_urls: imageUrls
                }
            });
    },
    imagekitUpload: async (req,res) => {
        try {
            const stringFile = req.file.buffer.toString('base64');

            const uploadFile = await imageKit.upload({
                fileName: req.file.originalname, 
                file: stringFile
            })

            return res.json({
                status: true,
                message: 'success',
                data: {
                    name: uploadFile.name,
                    url: uploadFile.url,
                    type: uploadFile.fileType,
                }
            })
        } catch (err) {
            throw (err);
        }
    }
}