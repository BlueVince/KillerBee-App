const encryption = require('../encryption/encryption');
const encryptionServer = encryption.server;
const encryptionClient = encryption.client;

module.exports = {
    RequestConnection: function (req, res) {
        try {
            encryptionServer.EstablishConnection(req.query.ip, req.body.publicKey, (err, result) => {
                if (!err) res.status(200).send(result);
                else res.status(400).send({'error': 'can\'t perform operation'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform operation'});
        }
    },
};
