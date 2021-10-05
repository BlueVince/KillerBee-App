import React, {Component} from 'react';
import '../../App.css';
import {Button, FormLabel, FormControl, Form, FormGroup, FormSelect, Modal} from 'react-bootstrap';

const fetching = require('../../encryption/fetching');

class StepToProcedeForm extends Component {
    constructor(props) {
        super(props);
        this.state = {processes: [], selectedProcess: '', steps: [], selectedStep: '', order: 0};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    onClose = e => {
        this.props.onClose && this.props.onClose(e);
    };

    componentDidMount() {
        let token = localStorage.getItem('token');
        fetching.FetchAPI('localhost:8080', '/Procede/Select/', {token: token}, (err, result) => {
            if (!err) {
                this.setState({processes: result.recordset, selectedProcess: result.recordset[0].pro_ID});
            } else console.error(err);
        });
        fetching.FetchAPI('localhost:8080', '/Etape/Select/', {token: token}, (err, result) => {
            if (!err) {
                this.setState({steps: result.recordset, selectedStep: result.recordset[0].eta_ID});
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
        let procede = this.state.selectedProcess;
        let etape = this.state.selectedStep;
        let ordre = this.state.order;
        let token = localStorage.getItem('token');
        fetching.FetchAPI('localhost:8080', '/EtapeProcede/Insert/', {procede: procede, etape: etape, ordre: ordre, token: token}, (err, result) => {
            if (!err) {
                window.location.reload(true);
            } else console.error(err);
        });
        this.setState({selectedProcess: '', selectedStep: '', ordre: 0});
    }


    render() {
        if (!this.props.show) {
            return null;
        }
        return (
            <div>
                <div className="form-display">
                    <h1>Ajouter une étape à un procédé</h1>
                    <Form id="steptoprocessForm" onSubmit={this.handleSubmit}>
                        <FormGroup className="mb-3" controlId="selectedProcess">
                            <FormLabel>
                                Procédé
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
                        <FormGroup className="mb-3" controlId="selectedStep">
                            <FormLabel>
                                Étape
                            </FormLabel>
                            <FormSelect name="selectedStep" value={this.state.selectedStep} onChange={this.handleChange}>
                                {this.state.steps.map(step => (
                                    <option value={step.eta_ID} key={step.eta_ID}>
                                        {step.eta_nom}
                                    </option>
                                )
                                )}
                            </FormSelect>
                        </FormGroup>
                        <FormGroup className="mb-3" controlId="order">
                            <FormLabel>
                                Ordre
                            </FormLabel>
                            <FormControl pattern="[0-9]" required type="number" min="0" placeholder="Ordre de l'étape" name="order" value={this.state.order} onChange={this.handleChange}>
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

export default StepToProcedeForm;