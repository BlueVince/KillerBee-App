import React, {Component} from 'react';
import '../../App.css';
import {Button, FormLabel, FormControl, Form, FormGroup, FormSelect, Modal} from 'react-bootstrap';

const fetching = require('../../encryption/fetching');

class IngredientToModelForm extends Component {
    constructor(props) {
        super(props);
        this.state = {models: [], selectedModel: '', ingredients: [], selectedIngredient: '', grammage: 0};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    onClose = e => {
        this.props.onClose && this.props.onClose(e);
    };

    componentDidMount() {
        let token = localStorage.getItem('token');
        fetching.FetchAPI('localhost:8080', '/Ingredient/Select/', {token: token}, (err, result) => {
            if (!err) {
                this.setState({ingredients: result.recordset, selectedIngredient: result.recordset[0].ing_ID});
            } else console.error(err);
        });
        fetching.FetchAPI('localhost:8080', '/Modele/Select/', {token: token}, (err, result) => {
            if (!err) {
                this.setState({models: result.recordset, selectedModel: result.recordset[0].mod_ID});
            } else console.error(err);
        });
    }

    handleChange(event) {
        this.setState(
            {[event.target.name]: event.target.value}
        );
    }

    async handleSubmit(event) {
        event.preventDefault();
        let modele = this.state.selectedModel;
        let ingredient = this.state.selectedIngredient;
        let grammage = this.state.grammage;
        let token = localStorage.getItem('token');
        fetching.FetchAPI('localhost:8080', '/IngredientModele/Insert/', {modele: modele, ingredient: ingredient, grammage: grammage, token: token}, (err, result) => {
            if (!err) {
                window.location.reload(true);
            } else console.error(err);
        });
        this.setState({selectedModel: '', selectedIngredient: '', grammage: 0});
    }

    render() {
        if (!this.props.show) {
            return null;
        }
        return (
            <div>
                <div className="form-display">
                    <h1>Ajouter un ingrédient à un modèle</h1>
                    <Form id="ingredientForm" onSubmit={this.handleSubmit}>
                        <FormGroup className="mb-3" controlId="selectedModel">
                            <FormLabel>
                                Modèle
                            </FormLabel>
                            <FormSelect name="selectedModel" value={this.state.selectedModel} onChange={this.handleChange}>
                                {this.state.models.map(model => (
                                    <option value={model.mod_ID} key={model.mod_ID}>
                                        {model.mod_nom}
                                    </option>
                                )
                                )}
                            </FormSelect>
                        </FormGroup>
                        <FormGroup className="mb-3" controlId="selectedIngredient">
                            <FormLabel>
                                Ingredients
                            </FormLabel>
                            <FormSelect name="selectedIngredient" value={this.state.selectedIngredient} onChange={this.handleChange}>
                                {this.state.ingredients.map(ingredient => (
                                    <option value={ingredient.ing_ID} key={ingredient.ing_ID}>
                                        {ingredient.ing_nom}
                                    </option>
                                )
                                )}
                            </FormSelect>
                        </FormGroup>
                        <FormGroup className="mb-3" controlId="grammage">
                            <FormLabel>
                                Grammage
                            </FormLabel>
                            <FormControl pattern="[0-9]" required type="number" min="0" placeholder="Grammage du freezebee" name="grammage" value={this.state.grammage} onChange={this.handleChange}>
                            </FormControl>
                        </FormGroup>
                        <Button variant="primary" type="submit">
                            Envoyer
                        </Button>
                    </Form>
                </div>
            </div>
        );
    }
}

export default IngredientToModelForm;