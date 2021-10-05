const jwtUtils = require('../utils/jwt.utils');
const sql = require('mssql')

const DBConnectionConfig = require('../configs/DBConnection').sqlConfig;
const encryptionServer = require('../encryption/encryption').server;

async function ConnectToDatabase() {
    await console.log('Connection to the database');
    try {
        // make sure that any items are correctly URL encoded in the connection string
        await sql.connect(DBConnectionConfig);
        console.log('Connection to the database completed');
    } catch (err) {
        console.error(err);
    }
}
ConnectToDatabase();

async function InsertLog(schema, action, cible, description, IP, utilisateur = '') {
    new sql.Request()
        .input('action', sql.VarChar(50), action)
        .input('cible', sql.VarChar(50), cible)
        .input('description', sql.VarChar(200), description)
        .input('IP', sql.VarChar(50), IP)
        .input('utilisateur', sql.VarChar(50), utilisateur)
        .execute(schema + '.InsertLog', (err, result) => {
            if (err) console.error(err);
        });
}

module.exports = {
    //Token
    LogIn: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    new sql.Request()
                    .input('nom', sql.VarChar(50), jsonBody.nom)
                    .input('mdp', sql.VarChar(200), jsonBody.mdp)
                    .execute('dbo.SelectUtilisateur', (err, result) => {
                        if (!err) {
                            if (result.recordset.length > 0) {
                                var userID = result.recordset[0].usr_ID
                                var sch = result.recordset[0].usr_sch;
                                var token = jwtUtils.generateToken({
                                    'id': result.recordset[0].usr_ID,
                                    'nom': result.recordset[0].usr_nom,
                                    'sch': sch,
                                });
                                InsertLog(sch, 'LogIn', 'dbo.Utilisateur', '', req.query.ip, userID);
                                encryptionServer.EncryptForSending(req.query.ip, JSON.stringify({'token': token}), (err, result) => {
                                    if (!err) res.status(200).send(result);
                                    else res.status(500).send({'error': 'failed to encrypt'});
                                });
                            } else res.status(404).send({'error': 'wrong username or password'});
                        } else res.status(400).send({'error': 'can\'t perform query'});
                    });
                }
                else res.status(500).send({'error': 'failed to decrypt'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // InsertModele
    InsertModele: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('nom', sql.VarChar(50), jsonBody.nom)
                            .input('description', sql.VarChar(200), jsonBody.description)
                            .input('prix', sql.Float, jsonBody.prix)
                            .input('gamme', sql.VarChar(50), jsonBody.gamme)
                            .execute(decodedToken.data.sch + '.InsertModele', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], '', req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // UpdateModele
    UpdateModele: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('ID', sql.Int, jsonBody.modele)
                            .input('nom', sql.VarChar(50), jsonBody.nom)
                            .input('description', sql.VarChar(200), jsonBody.description)
                            .input('prix', sql.Float, jsonBody.prix)
                            .input('gamme', sql.VarChar(50), jsonBody.gamme)
                            .execute(decodedToken.data.sch + '.UpdateModele', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], jsonBody.modele, req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // SelectModele
    SelectModele: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .execute(decodedToken.data.sch + '.SelectModele', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], '', req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // UpdateActifModele
    UpdateActifModele: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('ID', sql.Int, jsonBody.modele)
                            .input('actif', sql.Bit, jsonBody.actif)
                            .execute(decodedToken.data.sch + '.UpdateActifModele', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], jsonBody.modele, req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // InsertIngredient
    InsertIngredient: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('nom', sql.VarChar(50), jsonBody.nom)
                            .input('description', sql.VarChar(200), jsonBody.description)
                            .execute(decodedToken.data.sch + '.InsertIngredient', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], '', req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // UpdateIngredient
    UpdateIngredient: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('ID', sql.Int, jsonBody.ingredient)
                            .input('nom', sql.VarChar(50), jsonBody.nom)
                            .input('description', sql.VarChar(200), jsonBody.description)
                            .execute(decodedToken.data.sch + '.UpdateIngredient', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], jsonBody.ingredient, req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // SelectIngredient
    SelectIngredient: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .execute(decodedToken.data.sch + '.SelectIngredient', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], '', req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // UpdateActifIngredient
    UpdateActifIngredient: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('ID', sql.Int, jsonBody.ingredient)
                            .input('actif', sql.Bit, jsonBody.actif)
                            .execute(decodedToken.data.sch + '.UpdateActifIngredient', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], jsonBody.ingredient, req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // InsertIngredientModele
    InsertIngredientModele: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('modele', sql.Int, jsonBody.modele)
                            .input('ingredient', sql.Int, jsonBody.ingredient)
                            .input('grammage', sql.Float, jsonBody.grammage)
                            .execute(decodedToken.data.sch + '.InsertIngredientModele', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], '', req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // SelectIngredientModele
    SelectIngredientModele: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('modele', sql.Int, jsonBody.modele)
                            .input('ingredient', sql.Int, jsonBody.ingredient)
                            .execute(decodedToken.data.sch + '.SelectIngredientModele', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], '', req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // DeleteIngredientModele
    DeleteIngredientModele: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('modele', sql.Int, jsonBody.modele)
                            .input('ingredient', sql.Int, jsonBody.ingredient)
                            .execute(decodedToken.data.sch + '.DeleteIngredientModele', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], jsonBody.modele + ':' + jsonBody.ingredient, req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // InsertProcede
    InsertProcede: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('nom', sql.VarChar(50), jsonBody.nom)
                            .input('description', sql.VarChar(200), jsonBody.description)
                            .input('modele', sql.Int, jsonBody.modele)
                            .execute(decodedToken.data.sch + '.InsertProcede', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], '', req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // UpdateProcede
    UpdateProcede: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('ID', sql.Int, jsonBody.procede)
                            .input('nom', sql.VarChar(50), jsonBody.nom)
                            .input('description', sql.VarChar(200), jsonBody.description)
                            .execute(decodedToken.data.sch + '.UpdateProcede', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], jsonBody.procede, req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // SelectProcede
    SelectProcede: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .execute(decodedToken.data.sch + '.SelectProcede', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], '', req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // UpdateActifProcede
    UpdateActifProcede: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('ID', sql.Int, jsonBody.procede)
                            .input('actif', sql.Bit, jsonBody.actif)
                            .execute(decodedToken.data.sch + '.UpdateActifProcede', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], jsonBody.procede, req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // InsertEtape
    InsertEtape: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('nom', sql.VarChar(50), jsonBody.nom)
                            .input('description', sql.VarChar(200), jsonBody.description)
                            .execute(decodedToken.data.sch + '.InsertEtape', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], '', req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // UpdateEtape
    UpdateEtape: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('ID', sql.Int, jsonBody.etape)
                            .input('nom', sql.VarChar(50), jsonBody.nom)
                            .input('description', sql.VarChar(200), jsonBody.description)
                            .execute(decodedToken.data.sch + '.UpdateEtape', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], jsonBody.etape, req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // SelectEtape
    SelectEtape: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .execute(decodedToken.data.sch + '.SelectEtape', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], '', req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // UpdateActifEtape
    UpdateActifEtape: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('ID', sql.Int, jsonBody.etape)
                            .input('actif', sql.Bit, jsonBody.actif)
                            .execute(decodedToken.data.sch + '.UpdateActifEtape', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], jsonBody.etape, req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // InsertEtapeProcede
    InsertEtapeProcede: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('procede', sql.Int, jsonBody.procede)
                            .input('etape', sql.Int, jsonBody.etape)
                            .input('ordre', sql.Int, jsonBody.ordre)
                            .execute(decodedToken.data.sch + '.InsertEtapeProcede', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], '', req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // SelectEtapeProcede
    SelectEtapeProcede: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('procede', sql.Int, jsonBody.procede)
                            .input('etape', sql.Int, jsonBody.etape)
                            .execute(decodedToken.data.sch + '.SelectEtapeProcede', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], '', req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // DeleteEtapeProcede
    DeleteEtapeProcede: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('procede', sql.Int, jsonBody.procede)
                            .input('etape', sql.Int, jsonBody.etape)
                            .execute(decodedToken.data.sch + '.DeleteEtapeProcede', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], jsonBody.procede + ':' + jsonBody.etape, req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // InsertTest
    InsertTest: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('nom', sql.VarChar(50), jsonBody.nom)
                            .input('description', sql.VarChar(200), jsonBody.description)
                            .input('type', sql.VarChar(50), jsonBody.type)
                            .input('procede', sql.Int, jsonBody.procede)
                            .execute(decodedToken.data.sch + '.InsertTest', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], '', req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // UpdateTest
    UpdateTest: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('ID', sql.Int, jsonBody.test)
                            .input('nom', sql.VarChar(50), jsonBody.nom)
                            .input('description', sql.VarChar(200), jsonBody.description)
                            .input('type', sql.VarChar(50), jsonBody.type)
                            .execute(decodedToken.data.sch + '.UpdateTest', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], jsonBody.test, req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // SelectTest
    SelectTest: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .execute(decodedToken.data.sch + '.SelectTest', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], '', req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },

    // UpdateActifTest
    UpdateActifTest: function (req, res) {
        try {
            encryptionServer.DecryptReceived(req.query.ip, req.body, (err, result) => {
                if (!err) {
                    var jsonBody = JSON.parse(result);
                    // token verification
                    var token = jsonBody.token;
                    var decodedToken = jwtUtils.verifyToken(token);
                    if (!decodedToken.tokenValid) {
                        res.status(401).send({'error': 'invalid token'});
                    } else {
                        new sql.Request()
                            .input('ID', sql.Int, jsonBody.test)
                            .input('actif', sql.Bit, jsonBody.actif)
                            .execute(decodedToken.data.sch + '.UpdateActifTest', (err, result) => {
                                if (!err) {
                                    const path = req.originalUrl.split('?')[0];
                                    const pathParams = path.split('/');
                                    InsertLog(decodedToken.data.sch, pathParams[2], pathParams[1], jsonBody.test, req.query.ip, decodedToken.data.id);
                                    encryptionServer.EncryptForSending(req.query.ip, JSON.stringify(result), (err, result) => {
                                        if (!err) res.status(200).send(result);
                                        else res.status(400).send({'error': 'can\'t perform query'});
                                    });
                                } else res.status(400).send({'error': 'can\'t perform query'});
                            });
                    }
                } else res.status(400).send({'error': 'can\'t perform query'});
            });
        } catch (error) {
            res.status(400).send({'error': 'can\'t perform query'});
        }
    },
};
