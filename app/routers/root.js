const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
    res.status(200).json({ status: 200, message: 'OK' });
});
router.get('/err', (req, res, next) => {
    next(new Error('DOH!'));
});

module.exports = router;
