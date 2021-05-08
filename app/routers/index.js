const { Router } = require('express');
const rootRouter = require('./root');
const s3Router = require('./s3');

const router = Router();

router.use(rootRouter);
router.use(s3Router);

module.exports = router;
