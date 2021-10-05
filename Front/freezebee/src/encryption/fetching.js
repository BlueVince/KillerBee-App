const publicIp = require('public-ip');
const encryption = require('../encryption/encryption');
const encryptionClient = encryption.client;

module.exports = {
    /**
     * Create a connection with the API
     * @param {String} apiIp API's IP address
     * @param {String} url path to fetch from
     * @param {function} callback (Object: err, Object: result) the function to callback
     */
    CreateConnection: function (apiIp, path, callback) {
        try {
            encryptionClient.InitiateConnection( async (err, result) => {
                if (!err) {
                    let pubIp = await publicIp.v4();
                    fetch('http://' + apiIp + path + '?ip=' + pubIp, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(result),
                    }).then(res => res.json())
                        .then(
                            (result) => {
                                encryptionClient.ConnectionAccepted(result.publicKey, (err, result) => {
                                    if (!err) callback(false, result);
                                    else callback(err, null);
                                });
                            },
                            (error) => {
                                callback(error, null);
                            }
                        );
                }
                else callback(err, null);
            });
        } catch (error) {
            callback(error, null);
        }
    },

    /**
     * Create a connection with the API
     * @param {String} apiIp API's IP address
     * @param {String} url path to fetch from
     * @param {Object} data The data to send in the body of the fetch request
     * @param {function} callback (Object: err, Object: result) the function to callback
     */
    FetchAPI: function (apiIp, path, data, callback) {
        try {
            encryptionClient.EncryptForSending(JSON.stringify(data), async (err, result) => {
                if (!err) {
                    let pubIp = await publicIp.v4();
                    fetch('http://' + apiIp + path + '?ip=' + pubIp, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        body: JSON.stringify(result),
                    }).then(res => res.json())
                        .then(
                            (result) => {
                                if (!result.error) {
                                    encryptionClient.DecryptReceived(result, (err, result) => {
                                        if (!err) callback(false, JSON.parse(result));
                                        else callback(err, null);
                                    });
                                } else callback(result.error, null);
                            },
                            (error) => {
                                callback(error, null);
                            }
                        );
                }
                else callback(err, null);
            });
        } catch (error) {
            callback(error, null);
        }
    },
};
