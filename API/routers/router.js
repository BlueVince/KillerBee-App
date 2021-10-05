const express = require('express');

const ctrl = require('../routes/ctrl');
const encryption = require('../encryption/encryption');
const encryptionServer = encryption.server;

exports.router = (function () {
    var router = express.Router();

    router.route('/*/').all((function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    }));

    // LogIn
    router.route('/LogIn/').post(ctrl.LogIn);
    // InsertModele
    router.route('/Modele/Insert/').post(ctrl.InsertModele);
    // UpdateModele
    router.route('/Modele/Update/').post(ctrl.UpdateModele);
    // SelectModele
    router.route('/Modele/Select/').post(ctrl.SelectModele);
    // UpdateActifModele
    router.route('/ActifModele/Update/').post(ctrl.UpdateActifModele);
    // InsertIngredient
    router.route('/Ingredient/Insert/').post(ctrl.InsertIngredient);
    // UpdateIngredient
    router.route('/Ingredient/Update/').post(ctrl.UpdateIngredient);
    // SelectIngredient
    router.route('/Ingredient/Select/').post(ctrl.SelectIngredient);
    // UpdateActifIngredient
    router.route('/ActifIngredient/Update/').post(ctrl.UpdateActifIngredient);
    // InsertIngredientModele
    router.route('/IngredientModele/Insert/').post(ctrl.InsertIngredientModele);
    // SelectIngredientModele
    router.route('/IngredientModele/Select/').post(ctrl.SelectIngredientModele);
    // DeleteIngredientModele
    router.route('/IngredientModele/Delete/').post(ctrl.DeleteIngredientModele);
    // InsertProcede
    router.route('/Procede/Insert/').post(ctrl.InsertProcede);
    // UpdateProcede
    router.route('/Procede/Update/').post(ctrl.UpdateProcede);
    // SelectProcede
    router.route('/Procede/Select/').post(ctrl.SelectProcede);
    // UpdateActifProcede
    router.route('/ActifProcede/Update/').post(ctrl.UpdateActifProcede);
    // InsertEtape
    router.route('/Etape/Insert/').post(ctrl.InsertEtape);
    // UpdateEtape
    router.route('/Etape/Update/').post(ctrl.UpdateEtape);
    // SelectEtape
    router.route('/Etape/Select/').post(ctrl.SelectEtape);
    // UpdateActifEtape
    router.route('/ActifEtape/Update/').post(ctrl.UpdateActifEtape);
    // InsertEtapeProcede
    router.route('/EtapeProcede/Insert/').post(ctrl.InsertEtapeProcede);
    // SelectEtapeProcede
    router.route('/EtapeProcede/Select/').post(ctrl.SelectEtapeProcede);
    // DeleteEtapeProcede
    router.route('/EtapeProcede/Delete/').post(ctrl.DeleteEtapeProcede);
    // InsertTest
    router.route('/Test/Insert/').post(ctrl.InsertTest);
    // UpdateTest
    router.route('/Test/Update/').post(ctrl.UpdateTest);
    // SelectTest
    router.route('/Test/Select/').post(ctrl.SelectTest);
    // UpdateActifTest
    router.route('/ActifTest/Update/').post(ctrl.UpdateActifTest);

    return router;
})();
