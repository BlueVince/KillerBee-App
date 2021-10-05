const NodeRSA = require('node-rsa');

const base64Map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const privateKeyConfig = '-----BEGIN RSA PRIVATE KEY-----MIIEogIBAAKCAQEAjZS7lxRkhsLjlCoOzYZwaaJsEaBPNZcDbPZ8t1K2Z5cOl8qIDDW7kuS+1tuRojJd4zmKf+2icVvRcdyxHpnMTehYyhuNeQSRE/IWZ7Z5dHfuOW+7xGWdDQShKDRd8af7O22cW8lE5oGv0AesZ0rkdCGurbCNEkfDoVvzHJ05RqACqCQg3iHvJ43hBlC3JFj2Vgv+HjhALrzzU54DFnW9MmjVOVEesfygXZr2wFiQGvL9nwZOSQBhmvzz8uhPoJJAPYAokmKtnXdZ2SQY+ZcLjXaP2Szug8hrTldalRCegP6QGYXiaMJd1WAqkbXs8oa03ahu477IyIOM8ujtk76y8QIDAQABAoIBAF7iK6n/h7NszvoQCaWhkJqquIRDjHIcx7XxpvlxHD9mU+hUWkLci93RITh7JCmwWY2blX9QscoIv9/wCF+6sNoRedfRCUnuTpAwcOWGu/TbHzMs94iSlOMRlDOOjNsUOeHE/sHgrCVTCpF/YwJChcJyhE9w/8odgDUWm2I02BrExFq7loVRmY74H4PbLZnVHjHUQ/Bgqy0XsN8Bzr6jGZ6rbNZOdF7siW0pxKYSTO3S8drO0Zwrog5RhfI7N44AxFNK049z+VPvbSJ7p1xqYGKmFCxZvDbe2gfQvOZTi6hSOxnWhl28pBABoMSJr4x9en/efhl/ioe5DAWe+XG5drUCgYEA47jFMgdvuLeMGRKVUqPqKscV8QQuqBtPME2F9OzWTJbodT8hI95f4kbMLTnGIdYh+NltKlQjJZWr9WeU0BW+xgnOclkaN04ARDY/hvJpgBtV98EVnZcd3kAzX4tDQhgPsvBvktnSiMHgeW6ph+obx8Wd+b0hLVzENNvTbtsPQBMCgYEAnymQexaN2TL9HAfKSDiVrwiJx5LojdYbOPlcOQkYEunMI3dBv1TW+Xkc0n22dqNVpUJfu08dEYe8HJSoKRooDhANFp9DhszYvL0BpQXwHKedNi0ZGiqoyRYfDpxKfY7lS/B5xoOAQXY/4ZhmVgRrSCEoKpo9mPQuWKnO+sqwyWsCgYApnPIsGj/IOYJYcpTm7R01g/v2dxUvkw39fa0k/MKMbGc+RbMAovpSly1odk5GkKLUnqbcPVPO4nLx/WOsQs0B03juXGn2AUL7NA6X0mSFDHnBNH+GtL64hnLc2s4Hne4AfP9mjndyljs29Yn1VEqPTwV3RaBycalJH4Kbl1xKEQKBgB0+HL6QuUUjuh9RSxgT1WSQVAgn9LRCl0PThN8xzYuECy6k9Z56rvitCN+fm0uW3OB9HmuisHuNDcHOikrq9FsJFe6HGngE4PlkXI3+Vkxde2P9yzPkjJhNiS09B+6jt3tJVoZjmMfuOvRu9LZvH2rkNKYHKrQUgQNnR5EKdoq7AoGAEt442QFvBgkIit2T44p6j+8ewcIzQxWuZwWiWe24QmqlcMvQ0jDr3YTZoBEWeNCAyTSb3OpN2sCKBxdGcYzZ/zpUK1j6M0rObHjfhd0ITKxYhAGXrfBUYN99gNIZzHmdpHYi8+A0xqeNMazB4e/VfYYPUPnAAteOxUhxmWudf1o=-----END RSA PRIVATE KEY-----'
const publicKeyConfig = '-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjZS7lxRkhsLjlCoOzYZwaaJsEaBPNZcDbPZ8t1K2Z5cOl8qIDDW7kuS+1tuRojJd4zmKf+2icVvRcdyxHpnMTehYyhuNeQSRE/IWZ7Z5dHfuOW+7xGWdDQShKDRd8af7O22cW8lE5oGv0AesZ0rkdCGurbCNEkfDoVvzHJ05RqACqCQg3iHvJ43hBlC3JFj2Vgv+HjhALrzzU54DFnW9MmjVOVEesfygXZr2wFiQGvL9nwZOSQBhmvzz8uhPoJJAPYAokmKtnXdZ2SQY+ZcLjXaP2Szug8hrTldalRCegP6QGYXiaMJd1WAqkbXs8oa03ahu477IyIOM8ujtk76y8QIDAQAB-----END PUBLIC KEY-----'

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

// Connections
var connections = [];
/**
 * Create the connection with the given options.
 * @param {String} interlocutor The reference to the end point (ip, url, ...)
 * @param {bool} authorised 
 * @param {RSA} privateKey 
 * @param {RSA} publicKey 
 * @param {RSA} connPublicKey 
 * @returns new connection, null if the interlocutor already exists
 */
function MakeConnection(interlocutor, authorised = true, privateKey = null, publicKey = null, connPublicKey = null) {
    if (GetConnection(interlocutor)) DeleteConnection(interlocutor);
    let conn = {
        'interlocutor': interlocutor,
        'authorised': authorised,
        'privateKey': privateKey,
        'publicKey': publicKey,
        'connPublicKey': connPublicKey,
    };
    connections.push(conn);
    return conn;
}
function GetConnection(interlocutor) {
    return connections.find(c => c.interlocutor == interlocutor);
}
function DeleteConnection(interlocutor) {
    let conn = GetConnection(interlocutor);
    if (conn) connections.splice(connections.indexOf(conn));
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

module.exports.server = {
    //AuthorizeConnection: function() {},

    /**
     * Establish the connection, generate the RSA keys pair and store the client's public key.
     * @param {String} ref Client's ref
     * @param {RSA} connPublicKey Client's public key
     * @param {function} callback (err, res) res: The connection created
     */
    EstablishConnection: async function(ref, connPublicKey, callback) {
        try {
            let conn = MakeConnection(ref);
            if (conn) {
                let privateRSA = new NodeRSA({b: 2048});
                privateRSA.setOptions({encryptionScheme: 'pkcs1'});
                privateRSA.generateKeyPair(2048);
                conn.privateKey = privateRSA;
                conn.publicKey = privateRSA.exportKey('pkcs8-public');
                conn.connPublicKey = connPublicKey;
                callback(false, {'publicKey': conn.publicKey});
            } else throw 'Unable to create the connection';
        } catch (error) {
            callback(error, null);
        }
    },

    /**
     * Encode the message with a random key and encrypt the key to securely send them.
     * @param {String} ref End point's reference
     * @param {String} message The message to send
     * @param {function} callback (err, res) res: {String: encodedMsg, Object: encryptedKey} Set composed of the encoded message and the encrypted key
     */
     EncryptForSending: async function(ref, message, callback) {
        try {
            let conn = GetConnection(ref);
            if (conn) {
                // Encoding key generation and encryption
                let key = GenerateEncodingKey();
                let tempKey = new NodeRSA();
                tempKey.setOptions({encryptionScheme: 'pkcs1'});
                tempKey.importKey(conn.connPublicKey, 'pkcs8-public');
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
     * @param {String} ref End point's reference
     * @param {Object} encryptedMessage Set composed of the encoded message and the encrypted key
     * @param {function} callback (err, res) res: The decoded message
     */
    DecryptReceived: async function(ref, encryptedMessage, callback) {
        try {
            let conn = GetConnection(ref);
            if (conn) {
                // Encoding key decryption
                let decryptedKey = {
                    'subKey': conn.privateKey.decrypt(Buffer.from(encryptedMessage.encryptedKey.subKey)).toString(),
                    'transKey': Array.from(conn.privateKey.decrypt(Buffer.from(encryptedMessage.encryptedKey.transKey))),
                    'polyAlphaKey': Array.from(conn.privateKey.decrypt(Buffer.from(encryptedMessage.encryptedKey.polyAlphaKey))),
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
