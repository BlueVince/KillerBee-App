const NodeRSA = require('node-rsa');

const base64Map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

/**
 * Create the connection with the given options.
 * @param {bool} authorised 
 * @param {RSA} privateKey 
 * @param {RSA} publicKey 
 * @param {RSA} connPublicKey 
 * @returns new connection, null if the interlocutor already exists
 */
function MakeConnection(authorised = true, privateKey = null, publicKey = null, connPublicKey = null) {
    if (GetConnection()) DeleteConnection();
    let conn = {
        'interlocutor': 'API',
        'authorised': authorised,
        'privateKey': privateKey,
        'publicKey': publicKey,
        'connPublicKey': connPublicKey,
    };
    localStorage.setItem('connection', JSON.stringify(conn));
    return conn;
}
function GetConnection() {
    return JSON.parse(localStorage.getItem('connection'));
}
function SetConnection(conn) {
    localStorage.setItem('connection', JSON.stringify(conn));
}
function DeleteConnection() {
    let conn = GetConnection();
    if (conn) localStorage.removeItem('connection')
}

// Content encoding
function getRandomInt(start = 0, length = 1) {
    return Math.floor(Math.random() * (length) + start);
}
/**
 * Randomly generate a set of keys.
 * @returns Set of keys to encode a message
 */
function GenerateEncodingKey() {
    let subKey = '', base64MapCopy = base64Map;
    let transKey = [], polyAlphaKey = [], numberMap = [];
    // substitution key generation using base 64 map
    while (base64MapCopy.length > 0) {
        let i = getRandomInt(0, base64MapCopy.length);
        subKey += base64MapCopy[i];
        base64MapCopy = base64MapCopy.substr(0, i) + base64MapCopy.substring(i + 1);
    }
    // number map generation
    let transKeyLength = getRandomInt(20, 10);
    for (let i = 0; i < transKeyLength; i++) {
        numberMap.push(i);
    }
    // transposition key generation using number map
    while (numberMap.length > 0) {
        let i = getRandomInt(0, numberMap.length);
        transKey.push(numberMap[i]);
        numberMap.splice(i, 1);
    }
    // poly alpha key generation
    let polyAlphaKeyLength = getRandomInt(16, 8);
    for (let i = 0; i < polyAlphaKeyLength; i++) {
        polyAlphaKey.push(getRandomInt(0, 26));
    }
    return {
        'subKey': subKey,
        'transKey': transKey,
        'polyAlphaKey': polyAlphaKey,
    };
}
/**
 * Encode a message with the given set of keys, using the custom sysmetric algorithm.
 * @param {String} toEncode The message to encode (base 64)
 * @param {Object} key Set of keys
 * @returns Encoded message
 */
function Encode(toEncode, key) {
    // substitution
    for (let i = 0; i < toEncode.length; i++) {
        let iMap = base64Map.indexOf(toEncode[i]);
        if (iMap >= 0) toEncode = toEncode.replaceAt(i, key.subKey[iMap])
    }
    // transposition
    while (toEncode.length % key.transKey.length != 0) toEncode += '*'
    let transposed = toEncode
    for (let i = 0; i < toEncode.length; i++) {
        let iTrans = key.transKey[i % key.transKey.length] + key.transKey.length * Math.floor(i / key.transKey.length)
        transposed = transposed.replaceAt(iTrans, toEncode[i])
    }
    toEncode = transposed;
    // custom polyalpha substition
    for (let i = 0; i < toEncode.length; i++) {
        let iMap = base64Map.indexOf(toEncode[i]);
        if (iMap >= 0) {
            let iPoly = i % key.polyAlphaKey.length
            iMap = (iMap + key.polyAlphaKey[iPoly]) % key.subKey.length
            toEncode = toEncode.replaceAt(i, key.subKey[iMap])
        }
    }
    // return encoded 'toEncode' string
    return toEncode
}
/**
 * Decode a message with the given set of keys, using the custom sysmetric algorithm.
 * @param {String} encoded Encoded message to decode
 * @param {Object} key Set of keys
 * @returns Decoded message (base 64)
 */
function Decode(encoded, key) {
    // custom polyalpha substition
    for (let i = 0; i < encoded.length; i++) {
        let iMap = key.subKey.indexOf(encoded[i]);
        if (iMap >= 0) {
            let iPoly = i % key.polyAlphaKey.length
            iMap = (iMap - key.polyAlphaKey[iPoly] + base64Map.length) % base64Map.length
            encoded = encoded.replaceAt(i, base64Map[iMap])
        }
    }
    // transposition
    let transposed = encoded
    for (let i = 0; i < encoded.length; i++) {
        let iTrans = key.transKey[i % key.transKey.length] + key.transKey.length * Math.floor(i / key.transKey.length)
        transposed = transposed.replaceAt(i, encoded[iTrans])
    }
    encoded = transposed;
    while (encoded[encoded.length - 1] == '*') encoded = encoded.substr(0, encoded.length - 1)
    // substitution
    for (let i = 0; i < encoded.length; i++) {
        let iMap = key.subKey.indexOf(encoded[i]);
        if (iMap >= 0) encoded = encoded.replaceAt(i, base64Map[iMap])
    }
    // return decoded 'encoded' string
    return encoded
}

// Encryption and communication
module.exports.client = {
    // AskConnection: function() {},

    /**
     * Initiate the connection with the server. Generate RSA keys pair to send the public one to the server.
     * @param {function} callback (err, res) res: This public key
     */
    InitiateConnection: async function(callback) {
        try {
            let conn = MakeConnection();
            if (conn) {
                let privateRSA = new NodeRSA({b: 2048});
                privateRSA.setOptions({encryptionScheme: 'pkcs1'});
                privateRSA.generateKeyPair(2048);
                conn.privateKey = privateRSA.exportKey('pkcs1');
                conn.publicKey = privateRSA.exportKey('pkcs8-public');
                SetConnection(conn);
                callback(false, {'publicKey': conn.publicKey});
            } else throw 'Unable to create the connection';
        } catch (error) {
            callback(error, null);
        }
    },

    /**
     * Store the server's public key if the connection was accepted.
     * @param {RSA} connPublicKey Server's public key
     * @param {function} callback (err, res) res: true if the connection was accepted
     */
    ConnectionAccepted: async function(connPublicKey, callback) {
        try {
            let conn = GetConnection();
            if (conn) {
                conn.connPublicKey = connPublicKey;
                SetConnection(conn);
                callback(false, {'connection': true});
            } else throw 'Unable to find the connection';
        } catch (error) {
            callback(error, null);
        }
    },

    /**
     * Encode the message with a random key and encrypt the key to securely send them.
     * @param {String} message The message to send
     * @param {function} callback (err, res) res: {String: encodedMsg, Object: encryptedKey} Set composed of the encoded message and the encrypted key
     */
     EncryptForSending: async function(message, callback) {
        try {
            let conn = GetConnection();
            if (conn) {
                // Encoding key generation and encryption
                let key = GenerateEncodingKey();
                // let key64 = Buffer.from(JSON.stringify(key)).toString('base64');
                let tempKey = new NodeRSA();
                tempKey.setOptions({encryptionScheme: 'pkcs1'});
                tempKey.importKey(conn.connPublicKey, 'pkcs8-public');
                // let encryptedKey = tempKey.encrypt(key);
                let encryptedKey = {
                    'subKey': tempKey.encrypt(Buffer.from(key.subKey)),
                    'transKey': tempKey.encrypt(Buffer.from(key.transKey)),
                    'polyAlphaKey': tempKey.encrypt(Buffer.from(key.polyAlphaKey)),
                };
                // Message conversion to base 64 and encoding
                let mes64 = Buffer.from(message).toString('base64');
                let encodedMsg = Encode(mes64, key);

                // Encoded message + Encrypted Key
                callback(false, {
                    'encodedMsg': encodedMsg,
                    'encryptedKey': encryptedKey,
                });
            } else throw 'Unable to find the connection';
        } catch (error) {
            callback(error, null);
        }
    },

    /**
     * Decode the message with the decrypted key.
     * @param {Object} encryptedMessage Set composed of the encoded message and the encrypted key
     * @param {function} callback (err, res) res: The decoded message
     */
    DecryptReceived: async function(encryptedMessage, callback) {
        try {
            let conn = GetConnection();
            if (conn) {
                // Encoding key decryption
                // let decryptedKey = conn.privateKey.decrypt(encryptedMessage.encryptedKey);
                let tempKey = new NodeRSA();
                tempKey.setOptions({encryptionScheme: 'pkcs1'});
                tempKey.importKey(conn.privateKey, 'pkcs1');
                let decryptedKey = {
                    'subKey': tempKey.decrypt(Buffer.from(encryptedMessage.encryptedKey.subKey)).toString(),
                    'transKey': Array.from(tempKey.decrypt(Buffer.from(encryptedMessage.encryptedKey.transKey))),
                    'polyAlphaKey': Array.from(tempKey.decrypt(Buffer.from(encryptedMessage.encryptedKey.polyAlphaKey))),
                };
                // Message decoding
                let decodedMsg64 = Decode(encryptedMessage.encodedMsg, decryptedKey);
                let decodedMsg = Buffer.from(decodedMsg64, 'base64').toString('ascii');

                // Message conversion from base 64
                callback(false, decodedMsg);
            } else throw 'Unable to find the connection';
        } catch (error) {
            console.error(error);
            callback(error, null);
        }
    },
};
