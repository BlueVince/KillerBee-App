import React, {Component} from 'react';
import '../App.css';
import HomePage from '../pages/homePage';
import {Button, FormLabel, FormControl, Form, FormGroup} from 'react-bootstrap';
import {BrowserRouter as Router, Switch, Route, Link, Redirect} from 'react-router-dom';
import App from '../App';
import { sha256 } from 'js-sha256';

const fetching = require('../encryption/fetching');

class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {error: null, username: '', password: '', auth: false};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState(
            {[event.target.name]: event.target.value}
        );
    }

    handleSubmit(event) {
        event.preventDefault();
        fetching.CreateConnection('localhost:8080', '/Connection/Request/', (err, result) => {
            if (!err) {
                fetching.FetchAPI('localhost:8080', '/LogIn/', {nom: this.state.username, mdp: sha256(this.state.password)}, (err, result) => {
                    if (!err) {
                        localStorage.setItem('token', result.token);
                        this.setState({auth: true, erreur: null});
                        window.location.reload(true);
                    } else {
                        this.setState({erreur: err});
                    }
                });
            } else {
                this.setState({erreur: err});
            }
        });
    }

    /*
    addTokenIntoCache = (cacheName, url, response) => {
        const data = new Response(JSON.stringify(response));

        if ('caches' in window) {
            caches.open(cacheName).then((cache) => {
                cache.put(url, data);
            });
        }
    }
    */

    render() {
        if (this.state.auth) {
            return (
                <Router>
                    <Switch>
                        <Route exact path='/' component={App} />
                        <Redirect to={'/'}></Redirect>
                    </Switch>
                </Router>
            );
        } else {
            return (
                <div className="h-100 d-flex">
                    <div className="form-display">
                        <Form id="loginForm" onSubmit={this.handleSubmit}>
                            <FormGroup className="mb-3" controlId="username">
                                <FormLabel>
                                    Nom d'utilisateur
                                </FormLabel>
                                <FormControl required type="text" placeholder="Utilisateur" name="username" value={this.state.username} onChange={this.handleChange}>
                                </FormControl>
                            </FormGroup>
                            <FormGroup className="mb-3" controlId="password">
                                <FormLabel>
                                    Mot de passe
                                </FormLabel>
                                <FormControl required type="password" placeholder="Mot de passe" name="password" value={this.state.password} onChange={this.handleChange}>
                                </FormControl>
                            </FormGroup>
                            <Button variant="primary" type="submit">
                                Envoyer
                            </Button>
                        </Form>
                        <div style= {{'visibility' : this.state.erreur ? 'visible' : 'hidden'}}>Erreur : {this.state.erreur}</div>
                    </div>
                </div>
            );
        }
    }
}

export default LoginForm;