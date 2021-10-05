import React, {Component} from 'react';
import '../../App.css';
import { Form, FormControl, FormGroup, FormLabel, Button, Table, Col } from 'react-bootstrap';
import StepToProcedeForm from './StepToProcede';

const fetching = require('../../encryption/fetching');

class StepForm extends Component {
    constructor(props) {
        super(props);
        this.state = {name: '', description: '', steps: [], show: false};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        let token = localStorage.getItem('token');
        fetching.FetchAPI('localhost:8080', '/Etape/Select/', {token: token}, (err, result) => {
            if (!err) {
                this.setState({ steps: result.recordset });
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
        let token = localStorage.getItem('token');
        fetching.FetchAPI('localhost:8080', '/Etape/Insert/', {nom: name, description: description, token: token}, (err, result) => {
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
                            {this.state.steps.map(step => (
                                <tr key={step.eta_ID}>
                                    <td>{step.eta_nom}</td>
                                    <td>{step.eta_description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
                <Col className="stepProcessCol">
                    <div className="form-display">
                        <h1>Créer une étape</h1>
                        <Form id="stepForm" onSubmit={this.handleSubmit}>
                        <FormGroup className="mb-3" controlId="name">
                                <FormLabel>
                                    Nom
                                </FormLabel>
                                <FormControl required type="text" name="name" placeholder="Nom de l'étape" value={this.state.name} onChange={this.handleChange}>
                                </FormControl>
                            </FormGroup>
                            <FormGroup className="mb-3" controlId="description">
                                <FormLabel>
                                    Description
                                </FormLabel>
                                <FormControl required type="text" placeholder="Description de l'étape" name="description" value={this.state.description} onChange={this.handleChange}>
                                </FormControl>
                            </FormGroup>
                            <Button variant="primary" type="submit">
                                Envoyer
                            </Button>
                        </Form>
                    </div>
                    <Button className="m-auto mt-4 d-flex" variant="primary" onClick={e => {this.showModal();}}>
                        Ajouter une étape à un procédé
                    </Button>
                    <StepToProcedeForm onClose={this.showModal} show={this.state.show}>

                    </StepToProcedeForm>
                </Col>
            </div>
        );
      }
}

export default StepForm;