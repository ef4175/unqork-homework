const { Router } = require('express');

// Utilize the following when you create your router methods, alternatively,
// abstract these nitty gritty methods out into a `controllers` directory if that's your style
const { S3: AWSS3 } = require('@aws-sdk/client-s3');
const ModelS3 = require('../models/s3');

const router = Router();

router.get('/api/v1/s3', async (req, res) => {
    const buckets = await ModelS3.find({}, '-_id -__v');
    res.status(200).json(buckets);
});

router.get('/api/v1/s3/:name', async (req, res) => {
    const { name } = req.params;
    const obj = await ModelS3.findOne({ name }, '-_id -__v');
    if (!obj) {
        return res.status(404).end();
    }
    res.status(200).json(obj);
});

router.patch('/api/v1/s3/:name', async (req, res) => {
    const { name } = req.params;
    // Really the only fields that can be updated
    const { account_id, versioning } = req.body;
    const updateRes = await ModelS3.updateOne(
        { name },
        { account_id, versioning, modified: Date.now() },
    );
    if (updateRes.nModified === 0) {
        return res.status(404).end();
    }
    res.status(200).end();
});

router.delete('/api/v1/s3/:name', async (req, res) => {
    const { name } = req.params;
    const awsS3 = new AWSS3();
    awsS3.deleteBucket({ Bucket: name }, async err => {
        if (err) {
            const { message } = err;
            const code = message === 'No such bucket' ? 404 : 500;
            return res.status(code).json({ message });
        }
        await ModelS3.deleteOne({ name });
        res.status(200).json({ message: 'OK' });
    });
});

router.post('/api/v1/s3', (req, res) => {
    const awsS3 = new AWSS3();
    awsS3.createBucket({ Bucket: req.body.name }, async err => {
        if (err) {
            const { message } = err;
            const code = message === 'Bucket name already exists' ? 400 : 500;
            return res.status(code).json({ message });
        }
        const s3 = new ModelS3({
            name: req.body.name,
            account_id: req.body.account_id,
            versioning: req.body.versioning,
        });
        await s3.save();
        res.status(201).json({ message: 'OK' });
    });
});

module.exports = router;
