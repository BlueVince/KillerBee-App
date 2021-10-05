import React, {Component} from 'react';
import '../../App.css';
import {Form, FormControl, FormGroup, FormLabel, Button, FormSelect, Table} from 'react-bootstrap';

const fetching = require('../../encryption/fetching');

class ProcedeForm extends Component {
    constructor(props) {
        super(props);
        this.state = {name: '', description: '', models: [], selectedModel: '', processes: []};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        let token = localStorage.getItem('token');
        fetching.FetchAPI('localhost:8080', '/Procede/Select/', {token: token}, (err, result) => {
            if (!err) {
                this.setState({processes: result.recordset});
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
        let nom = this.state.name;
        let description = this.state.description;
        let modele = this.state.selectedModel;
        let token = localStorage.getItem('token');
        fetching.FetchAPI('localhost:8080', '/Procede/Insert/', {nom: nom, description: description, modele: modele, token: token}, (err, result) => {
            if (!err) {
                window.location.reload(true);
            } else console.error(err);
        });
        this.setState({name: '', description: '', selectedModel: ''});
    }

    renderModel(process) {
        let models = this.state.models;
        for (let i = 0; i < models.length; i++) {
            if (models[i].mod_ID == process.mod_ID) return models[i].mod_nom;
        }
        return process.mod_ID;
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
                                <th>Modèle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.processes.map(process => (
                                <tr key={process.pro_ID}>
                                    <td>{process.pro_nom}</td>
                                    <td>{process.pro_description}</td>
                                    <td>{this.renderModel(process)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
                <div className="form-display">
                    <h1>Ajouter un procédé</h1>
                    <Form id="procedeForm" onSubmit={this.handleSubmit}>
                        <FormGroup className="mb-3" controlId="name">
                            <FormLabel>
                                Nom
                            </FormLabel>
                            <FormControl required type="text" name="name" placeholder="Nom du procédé" value={this.state.name} onChange={this.handleChange}>
                            </FormControl>
                        </FormGroup>
                        <FormGroup className="mb-3" controlId="description">
                            <FormLabel>
                                Description
                            </FormLabel>
                            <FormControl required type="text" placeholder="Description du procédé" name="description" value={this.state.description} onChange={this.handleChange}>
                            </FormControl>
                        </FormGroup>

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
                        <Button variant="primary" type="submit">
                            Envoyer
                        </Button>
                    </Form>
                </div>
            </div>
        );
    }
}

export default ProcedeForm;