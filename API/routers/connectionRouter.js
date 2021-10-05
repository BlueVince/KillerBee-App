const express = require('express');

const ctrl = require('../routes/connectionCtrl');

exports.router = (function () {
    var router = express.Router();

    router.route('/*/').all((function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    }));

    router.route('/Request/').post(ctrl.RequestConnection);
    //router.route('/Test/').get(ctrl.TestSend);

    return router;
})();
