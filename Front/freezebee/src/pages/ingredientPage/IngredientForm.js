import React, {Component} from 'react';
import '../../App.css';
import {Form, FormControl, FormGroup, FormLabel, Button, Col, Table} from 'react-bootstrap';
import IngredientToModelForm from './IngredientToModelForm';

const fetching = require('../../encryption/fetching');

class IngredientForm extends Component {
    constructor(props) {
        super(props);
        this.state = {name: '', description: '', show: false, ingredients: []};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        let token = localStorage.getItem('token');
        fetching.FetchAPI('localhost:8080', '/Ingredient/Select/', {token: token}, (err, result) => {
            if (!err) {
                this.setState({ ingredients: result.recordset });
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
        let name = this.state.name;
        let description = this.state.description;
        let token = localStorage.getItem('token');
        fetching.FetchAPI('localhost:8080', '/Ingredient/Insert/', {nom: name, description: description, token: token}, (err, result) => {
            if (!err) {
                window.location.reload(true);
            } else console.error(err);
        });
        this.setState({name: '', description: ''});
    }

    showModal = e => {
        this.setState({show: !this.state.show});
    }

    render() {
        return (
            <div>
                <div className="modelTable">
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.ingredients.map(ingredient => (
                                <tr key={ingredient.ing_ID}>
                                    <td>{ingredient.ing_nom}</td>
                                    <td>{ingredient.ing_description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
                <Col className="ingredientModelCol">
                    <div className="form-display">
                        <h1>Créer un ingrédient</h1>
                        <Form id="ingredientForm" onSubmit={this.handleSubmit}>
                            <FormGroup className="mb-3" controlId="name">
                                <FormLabel>
                                    Nom
                                </FormLabel>
                                <FormControl required type="text" name="name" placeholder="Nom de l'ingrédient" value={this.state.name} onChange={this.handleChange}>
                                </FormControl>
                            </FormGroup>
                            <FormGroup className="mb-3" controlId="description">
                                <FormLabel>
                                    Description
                                </FormLabel>
                                <FormControl required type="text" name="description" placeholder="Description de l'ingrédient" value={this.state.description} onChange={this.handleChange}>
                                </FormControl>
                            </FormGroup>
                            <Button variant="primary" type="submit">
                                Envoyer
                            </Button>
                        </Form>
                    </div>
                    <Button className="m-auto mt-4 d-flex" variant="primary" onClick={e => {this.showModal();}}>
                        Ajouter un ingrédrient à un modèle
                    </Button>
                    <IngredientToModelForm onClose={this.showModal} show={this.state.show}>

                    </IngredientToModelForm>
                </Col>
            </div>
        );
    }
}

export default IngredientForm;