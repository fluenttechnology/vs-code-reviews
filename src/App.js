import React from 'react';
import Reviews from './Reviews.js';
import Analysis from "./Analysis.js";
import DataFilter from "./DataFilter.js";
import logo from './logo.svg';
import './App.css';

const App = props => 

    <div className="App">
        
        <header>
        
            <img src={logo} className="App-logo" alt="logo" />
            <h2>Code reviews #ftw</h2>

        </header>
        <section>
          
            <p>Here you can see code review response times etc.</p>
            <DataFilter data={props.data} ops={props.ops} />
            <div className="row">

                <Reviews data={props.data} />
                <Analysis data={props.data} />
                
            </div>

        </section>

    </div>
    
export default App;
