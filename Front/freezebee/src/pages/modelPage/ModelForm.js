import React, {Component} from 'react';
import '../../App.css';
import {FormLabel, Form, FormControl, FormGroup, Button, Table } from 'react-bootstrap';

const fetching = require('../../encryption/fetching');

class ModelForm extends Component {
    constructor(props) {
        super(props);
        this.state = {erreur: null, name: '', description: '', prix: 0, gamme: '', models: []};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        let token = localStorage.getItem('token');
        fetching.FetchAPI('localhost:8080', '/Modele/Select/', {token: token}, (err, result) => {
            if (!err) {
                this.setState({ models: result.recordset });
            } else console.error(err);
        });
    }

    handleChange(event) {
        this.setState(
            {[event.target.name] : event.target.value}
        );
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        let name = this.state.name;
        let description = this.state.description;
        let prix = this.state.prix;
        let gamme = this.state.gamme;
        let token = localStorage.getItem('token');
        fetching.FetchAPI('localhost:8080', '/Modele/Insert/', {nom: name, description: description, prix: prix, gamme: gamme, token: token}, (err, result) => {
            if (!err) {
                window.location.reload(true);
            } else console.error(err);
        });
        this.setState({name: '', description: '', prix: 0, gamme: ''});
    }

    render() {
            if (this.state.erreur) {
                return <div>Erreur : {this.state.erreur}</div>
            } else {
                return(
                    <div>
                        <div className="modelTable">
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Nom</th>
                                        <th>Description</th>
                                        <th>Prix</th>
                                        <th>Gamme</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.models.map(model => (
                                        <tr key={model.mod_ID}>
                                            <td>{model.mod_nom}</td>
                                            <td>{model.mod_description}</td>
                                            <td>{model.mod_prix}</td>
                                            <td>{model.mod_gamme}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        <div className="form-display">
                            <h1>Ajouter un modèle</h1>
                            <Form id="freezebeeForm" onSubmit={this.handleSubmit}>
                                <FormGroup className="mb-3" controlId="name">
                                    <FormLabel>
                                        Nom
                                    </FormLabel>
                                    <FormControl required type="text" placeholder="Nom du freezebee" name="name" value={this.state.name} onChange={this.handleChange}>
                                    </FormControl>
                                </FormGroup>
                                <FormGroup className="mb-3" controlId="description">
                                    <FormLabel>
                                        Description
                                    </FormLabel>
                                    <FormControl required type="text" placeholder="Description du freezebee" name="description" value={this.state.description} onChange={this.handleChange}>
                                    </FormControl>
                                </FormGroup>
                                <FormGroup className="mb-3" controlId="prix">
                                    <FormLabel>
                                        Prix
                                    </FormLabel>
                                    <FormControl pattern="[0-9]" min="0" required type="number" placeholder="Prix du freezebee" name="prix" value={this.state.prix} onChange={this.handleChange}>
                                    </FormControl>
                                </FormGroup>
                                <FormGroup className="mb-3" controlId="gamme">
                                    <FormLabel>
                                        Gamme
                                    </FormLabel>
                                    <FormControl required type="text" placeholder="Gamme du freezebee" name="gamme" value={this.state.gamme} onChange={this.handleChange}>
                                    </FormControl>
                                </FormGroup>
                                <Button variant="primary" type="submit">
                                    Envoyer
                                </Button>
                            </Form>
                        </div>
                    </div>
                )
            }
      }
}

export default ModelForm;