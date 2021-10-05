import React, {Component} from 'react';
import '../../App.css';
import { Form, FormControl, FormGroup, FormLabel, Button, FormSelect, Table } from 'react-bootstrap';

const fetching = require('../../encryption/fetching');

class TestForm extends Component {
    constructor(props) {
        super(props);
        this.state = {name: '', description: '', type: '', processes: [], selectedProcess: '', tests: []};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        let token = localStorage.getItem('token');
        fetching.FetchAPI('localhost:8080', '/Test/Select/', {token: token}, (err, result) => {
            if (!err) {
                this.setState({ tests: result.recordset });
            } else console.error(err);
        });
        fetching.FetchAPI('localhost:8080', '/Procede/Select/', {token: token}, (err, result) => {
            if (!err) {
                this.setState({ processes: result.recordset, selectedProcess: result.recordset[0].pro_ID });
            } else console.error(err);
        });
    }

    handleChange(event) {
        this.setState(
            {[event.target.name] : event.target.value}
        );
      }
    
    handleSubmit(event) {
        event.preventDefault();
        let name = this.state.name;
        let description = this.state.description;
        let type = this.state.type;
        let procede = this.state.selectedProcess;
        let token = localStorage.getItem('token');
        fetching.FetchAPI('localhost:8080', '/Test/Insert/', {nom: name, description: description, type: type, procede: procede, token: token}, (err, result) => {
            if (!err) {
                window.location.reload(true);
            } else console.error(err);
        });
        this.setState({name: '', description: '', type: '', selectedProcess: ''});
    }

    renderProcess(test) {
        let processes = this.state.processes;
        for (let i = 0; i < processes.length; i++) {
            if (processes[i].pro_ID == test.pro_ID) return processes[i].pro_nom;
        }
        return test.pro_ID;
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
                                <th>Type</th>
                                <th>Procédé</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.tests.map(test => (
                                <tr key={test.tes_ID}>
                                    <td>{test.tes_nom}</td>
                                    <td>{test.tes_description}</td>
                                    <td>{test.tes_type}</td>
                                    <td>{this.renderProcess(test)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
                <div className="form-display">
                    <h1>Créer un test de validation</h1>
                    <Form id="testForm" onSubmit={this.handleSubmit}>
                    <FormGroup className="mb-3" controlId="name">
                        <FormLabel>
                            Nom
                        </FormLabel>
                        <FormControl required type="text" name="name" placeholder="Nom du test" value={this.state.name} onChange={this.handleChange}>
                        </FormControl>
                    </FormGroup>
                    <FormGroup className="mb-3" controlId="description">
                        <FormLabel>
                            Description
                        </FormLabel>
                        <FormControl required type="text" placeholder="Description du test" name="description" value={this.state.description} onChange={this.handleChange}>
                        </FormControl>
                    </FormGroup>
                    <FormGroup className="mb-3" controlId="type">
                        <FormLabel>
                            Type
                        </FormLabel>
                        <FormControl required type="text" placeholder="Type du test" name="type" value={this.state.type} onChange={this.handleChange}>
                        </FormControl>
                    </FormGroup>
                    <FormGroup className="mb-3" controlId="selectedProcess">
                        <FormLabel>
                            Procédés
                        </FormLabel>
                        <FormSelect name="selectedProcess" value={this.state.selectedProcess} onChange={this.handleChange}>
                            {this.state.processes.map(process => (
                                    <option value={process.pro_ID} key={process.pro_ID}>
                                        {process.pro_nom}
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

export default TestForm;