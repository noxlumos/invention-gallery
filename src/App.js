import React, { Component } from 'react';
import { Container} from 'reactstrap';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import HomePage from './components/HomePage.js'
import UserPage from './components/UserPage.js'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
        
    }
    
  }

  render(){
    return (
      <Container fluid={true}>
        <Breadcrumb>
          <BreadcrumbItem active>Invention Gallery</BreadcrumbItem>
        </Breadcrumb>                      
        <Router>
            <Switch>
                <Route path="/" exact component={HomePage}/>
                <Route path='/:username' component={UserPage}/>
            </Switch>
        </Router>
      </Container>
    );
   
    
  }
}

export default App;
