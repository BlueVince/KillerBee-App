import { Component } from "react";
import {Image} from "react-bootstrap";
import killerbee from '../assets/killerbee.png';
import Background from '../assets/background-2.jpg';
import './homePage.css';

class HomePage extends Component {

    render() {
        return(
            <div className="background-image">
                <h1 className="titre">Bienvenue sur le site de KillerBee</h1>
            </div>
        )
    }

}


export default HomePage;