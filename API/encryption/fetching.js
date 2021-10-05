const encryption = require('../encryption/encryption');
const encryptionClient = encryption.client;

module.exports = {
    /**
     * Create a connection with the API
     * @param {String} ip API's IP address
     * @param {String} url path to fetch from
     * @param {function} callback (Object: err, Object: result) the function to callback
     */
    CreateConnection: function (ip, path, callback) {
        try {
            encryptionClient.InitiateConnection(ip, (err, result) => {
                // TODO, fetch "ip + path"
                fetch("data.json", {
                    // TODO, post verb
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                }
                ).then(res => res.json())
                    .then(
                        (result) => {
                            encryptionClient.ConnectionAccepted(ip, result.publicKey, (err, result) => {
                                if (!err) callback(false, JSON.parse(result));
                                else callback(error, null);
                            });
                        },
                        (error) => {
                            callback(error, null);
                        }
                    )
            });
        } catch (error) {
            callback(error, null);
        }
    },

    /**
     * Create a connection with the API
     * @param {String} ip API's IP address
     * @param {String} url path to fetch from
     * @param {Object} data The data to send in the body of the fetch request
     * @param {function} callback (Object: err, Object: result) the function to callback
     */
    FetchAPI: function (ip, path, data, callback) {
        try {
            encryptionClient.EncryptForSending(ip, data, (err, result) => {
                // TODO, fetch "ip + path"
                fetch("data.json", {
                    // TODO, post verb
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: data
                }
                ).then(res => res.json())
                    .then(
                        (result) => {
                            encryptionClient.DecryptReceived(ip, result, (err, result) => {
                                if (!err) callback(false, JSON.parse(result));
                                else callback(error, null);
                            });
                        },
                        (error) => {
                            callback(error, null);
                        }
                    )
            });
        } catch (error) {
            callback(error, null);
        }
    },
};
