import './App.css';
import React, {Component} from 'react';
import IngredientForm from './pages/ingredientPage/IngredientForm';
import HomePage from './pages/homePage';
import ModelForm from './pages/modelPage/ModelForm';
import {BrowserRouter as Router, Switch, Route, Link, Redirect, BrowserRouter} from 'react-router-dom';
import ProcedeForm from './pages/procedePage/ProcedeForm';
import {Navbar, NavbarBrand, Container, Image, Nav, Button} from 'react-bootstrap';
import Logo from './assets/logo.png';
import NavbarToggle from 'react-bootstrap/esm/NavbarToggle';
import NavbarCollapse from 'react-bootstrap/esm/NavbarCollapse';
import StepForm from './pages/stepPage/StepForm';
import TestForm from './pages/testPage/TestForm';
import LoginForm from './pages/loginPage';
import ReactDOM from "react-dom";

const fetching = require('./encryption/fetching');

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {token: null};
  }

  componentDidMount() {
    this.setState({token: localStorage.getItem('token') ? true : false});
  }

  componentWillUnmount() {
  }

  clearToken() {
    localStorage.removeItem('token');
    this.setState({token: false});
  }

  render() {
    return (
      <BrowserRouter>
        <Navbar id="navbar" key="navbar" fixed="top" collapseOnSelect expand="lg" bg="dark" variant="dark">
          <Container>
            <Image src={Logo} className="mx-2" alt="KillerBee" height="35" />
            <NavbarBrand as={Link} to={'/'}>KillerBee</NavbarBrand>
            <NavbarToggle aria-controls="responsive-navbar-nav" />
            <NavbarCollapse className="justify-content-md-end" id="responsive-navbar-nav">
              <Nav>
                {
                  this.state.token == null
                    ? null
                    : this.state.token == false
                      ? <Button key="login" as={Link} to={"/login"} variant="primary">Connexion</Button>
                      : [
                        <NavbarBrand key="freezebee" as={Link} to={'/freezebee'}>Freezebee</NavbarBrand>,
                        <NavbarBrand key="procede" as={Link} to={"/procede"}>Procédé</NavbarBrand>,
                        <NavbarBrand key="ingredient" as={Link} to={"/ingredient"}>Ingrédients</NavbarBrand>,
                        <NavbarBrand key="etape" as={Link} to={"/etape"}>Étapes</NavbarBrand>,
                        <NavbarBrand key="test" as={Link} to={"/test"}>Tests et validation</NavbarBrand>,
                        <Button key="logout" as={Link} onClick={() => this.clearToken()} to={'/'} variant="primary">Déconnexion</Button>,
                      ]
                }
              </Nav>
            </NavbarCollapse>
          </Container>
        </Navbar>
        <Switch>
          <Route exact path='/' component={HomePage} />
          <Route key="loginRoute" exact path='/login' component={LoginForm} />
          <Route key="homeRoute" exact path='/' component={HomePage} />
          <Route key="ingredientRoute" path='/ingredient' component={IngredientForm} />
          <Route key="freezebeeRoute" path='/freezebee' component={ModelForm} />
          <Route key="procedeRoute" path='/procede' component={ProcedeForm} />
          <Route key="etapeRoute" path='/etape' component={StepForm} />
          <Route key="testRoute" path='/test' component={TestForm} />
          <Redirect to={'/'}></Redirect>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
