let express = require('express');
let router = express.Router();

router.use('/nginx', require('./nginx.route.js'));

module.exports = router;
