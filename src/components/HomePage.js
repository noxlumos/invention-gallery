import React, { Component } from 'react';

import { Col, Row, Button, Form, FormGroup, Input, Container, Alert } from 'reactstrap';
import {
    Stitch,
    AnonymousCredential,
    RemoteMongoClient
  } from "mongodb-stitch-browser-sdk";
import { Redirect } from 'react-router';



class HomePage extends Component {

  constructor(props) {
    super(props);

    this.state = {
        username: "",
        titles: [],
        message: "",
        color: null,
        redirect: false,
    }
    this.addUser = this.addUser.bind(this);
    this.login = this.login.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount(){
    this.client = Stitch.initializeDefaultAppClient("inventiongallery-aorcq");
    const mongodb = this.client.getServiceClient(
        RemoteMongoClient.factory,
        "inventionGallery"
      );
      this.db = mongodb.db("inventionGallery");
      this.client.auth
      .loginWithCredential(new AnonymousCredential())
      .then(user => {
        console.log(user.id)
      })
      .catch(console.error);
  }

  addUser(){
    this.db.collection("users").findOne({username: this.state.username})
    .then( res =>{
      if(res !== null){
        this.setState({message: "username already exits.",
                       color: "danger"});
        console.log(this.state.message);
      }
      else{
        this.db
        .collection("users")
        .insertOne({
          owner_id: this.client.auth.user.id,
          username: this.state.username,
          gallery: []
        })
        .then(res=>{
          console.log(res);
          this.setState({message: "user added",
                         color: "secondary"})
        })
        .catch(console.error)
      }})
    .catch(console.error)
  }

  login(){
    console.log(this.db.collection("users"))
    this.db.collection("users").findOne({username: this.state.username})
    .then( res =>{
      if(res !== null){
       this.setState({redirect:true}); 
      }
      else{
        this.setState({message: "username not found.",
                       color: "danger"});
        console.log(this.state.message);
      }})
    .catch(console.error)

  }
  deleteUser(){

    const query = { "username": this.state.username };
    this.db.collection("users").deleteOne(query)
    .then(result => {
      console.log(`Deleted ${result.deletedCount} item.`);
      if(result.deletedCount===0){
        this.setState({message: "user not found",
                       color: "danger"})
      }
      else{
        this.setState({message: "user deleted",
                       color: "secondary"})
      }
      
    })
    .catch(err => console.error(`Delete failed with error: ${err}`))
  }

  handleInputChange(event) {
    this.setState({
      username: event.target.value
    });
  }

  render() {
    if(this.state.redirect){
      return <Redirect push to={"/" + this.state.username} />;
    }
    let error = (this.state.message === "") ? 
        null :
        <Alert color={this.state.color}>
            {this.state.message}            
        </Alert>  ;
    return (  
    <Container fluid={true}>
        <Row>
              <br/><br/><br/>
        </Row>
        <Row >
        <Col md={{ offset: 4 }}>
            <Form>
                <FormGroup>
                    <Input  type="text" 
                            name="username" 
                            placeholder="username" 
                            value = {this.state.username}
                            onChange={this.handleInputChange}/>
                </FormGroup>
                <Button  size="sm" outline color="secondary"  block onClick = {this.addUser} >Add User</Button>
                <Button  size="sm" outline color="secondary"  block onClick = {this.login}>Login</Button>
                <Button  size="sm" outline color="secondary"  block onClick = {this.deleteUser}>Delete User</Button>
                <br/>
                {error}
            </Form>
        </Col>
      </Row>
    </Container>
    );
  }
}

export default HomePage;
