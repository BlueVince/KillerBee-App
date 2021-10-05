const jwt = require('jsonwebtoken');

// const JWT_SIGN_SECRET = '0grxdzox4a8bme8mxg7jg9xl2jemqqk7lwnj2fbceoj9y5g4klol1u2dqy7q774r';
const jwtMap = 'abcdefghijklmnopqrstuvwxyz0123456789';
const JWT_SIGN_SECRET = GenerateSecret();

function getRandomInt(start = 0, length = 1) {
    return Math.floor(Math.random() * (length) + start);
}
function GenerateSecret() {
    let secret = [];
    for (let i = 0; i < 128; i++) {
        let iMap = getRandomInt(0, jwtMap.length);
        secret.push(jwtMap[iMap]);
    }
    return secret.toString();
}

module.exports = {
    generateToken: function (data) {
        return jwt.sign(data,
            JWT_SIGN_SECRET,
            {expiresIn: '1h'});
    },
    verifyToken: function (token) {
        try {
            var decoded = jwt.verify(token, JWT_SIGN_SECRET);
            return {'tokenValid': true, 'data': decoded};
        } catch (err) {
            console.error(err);
            return {'tokenValid': false};
        }
    }
}
