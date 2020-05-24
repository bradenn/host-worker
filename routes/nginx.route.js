let express = require('express');
let router = express.Router();

let nginxController = require('../controllers/nginx.controller');

let proxyController = nginxController.proxy;

router.route('/proxy/:domain')
    .get(proxyController.get)
    .post(proxyController.post)
    .put(proxyController.put)
    .delete(proxyController.delete);

module.exports = router;
