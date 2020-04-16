import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { Col, Row, Button, Form, FormGroup, Input, Container, Label, Table  } from 'reactstrap';
import { Toast, ToastBody, ToastHeader } from 'reactstrap';
import {
  Stitch,
  RemoteMongoClient,
  AnonymousCredential,
} from "mongodb-stitch-browser-sdk";
import Gallery from './Gallery';

class UserPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
        user: null,
        rating: 0,
        username: "",
        productName: "",
        photo: "",
        cost: "",
        metarials: "",
        inventors: "",
        name1: "",
        val1: "",
        name2: "",
        val2: "",
        products: [],
    }
    this.submit = this.submit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this)
    this.loadData = this.loadData.bind(this)
  }

  loadData(){
    const mongoClient = this.app.getServiceClient(
      RemoteMongoClient.factory,
      "inventionGallery"
    );
    this.db = mongoClient.db("inventionGallery");
    const users = this.db.collection("users");
    users
      .find({ username: this.props.match.params.username })
      .asArray()
      .then(user => {
        this.setState({ user: user[0],
                        products: [...user[0].gallery] });
      })
      .catch(err => {
        console.warn(err);
      });
    const ratings = this.db.collection("ratings");
    ratings
      .find({ username: this.props.match.params.username })
      .asArray()
      .then(result => {
        var total = 0
        var a = 0
        for(var res of result){
            for(var rate of res.ratings){
              a = a +1;
              total = total + parseInt(rate.rate);
            }
        }
        var avg = a === 0 ? 0 : total / a
        this.setState({rating: avg });
      })  
      .catch(err => {
        console.warn(err);
      });
  }

  componentDidMount(){
    this.setState(this.props.match.params);
    if (Stitch.hasAppClient("inventiongallery-aorcq")) {
      this.app = Stitch.getAppClient("inventiongallery-aorcq");
      this.loadData()
    }
    else{
      this.app = Stitch.initializeDefaultAppClient("inventiongallery-aorcq");
      this.app.auth
      .loginWithCredential(new AnonymousCredential())
      .then(user => {
        console.log(user.id)
      })
      .catch(console.error);
      this.loadData()
    }  
  }
  handleInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }
  submit(){
    this.db.collection("users").updateOne({
      owner_id: this.app.auth.user.id,
      username: this.state.username
    },
    { "$addToSet": { 
        "gallery": {
            "productName": this.state.productName,
            "photo": this.state.photo,
            "cost": this.state.cost,
            "metarials": this.state.metarials,
            "inventors": this.state.inventors,
            "option1": {
              "name": this.state.name1,
              "val": this.state.val1
            },
            "option2": {
              "name": this.state.name2,
              "val": this.state.val2 
      }}}},
      {
        upsert: true
      }
      ).then(res=>{
      console.log(res);
      console.log("product added")
    })
    .catch(console.error)
    const ratings = this.db.collection("ratings");
    ratings.insertOne({
      owner_id: this.app.auth.user.id,
      username: this.state.username,
      productName: this.state.productName,
      ratings: []
    })
    .then(res=>{
      console.log(res);
      console.log("rating added")
    })
    .catch(console.error)
  }

  deleteProduct(event){
    console.log(event + "yay")
    this.db.collection("users").updateOne({
      owner_id: this.app.auth.user.id,
      username: this.state.username
    },
    { "$pull": { 
        "gallery": {
            "productName": event,  
      }}}
      ).then(res=>{
      console.log(res);
      console.log("product deleted")
    })
    .catch(console.error)
  }

  render() {
    let products = this.state.user ? this.state.products.map((product, index)=>{
      return(
        <tr key ={index}>
          <th scope="row">{index}</th>
          <td>{product.productName}</td>
          <td><Button outline color="danger" size="sm" value={product.productName} onClick = {() => this.deleteProduct(product.productName)}>X</Button></td>
        </tr>
      )
    }) : null;
    return (
      <Container fluid={true}>
      <Row>
        <Col xs="3">
          <Toast xs="3" >
            <ToastHeader>
              Welcome {this.state.username}!
            </ToastHeader>
            <ToastBody>
              your overall rating: {this.state.rating}
            </ToastBody>
          </Toast>
          <Toast>
            <ToastHeader>
              Your Products
            </ToastHeader>
            <ToastBody>
            <Table>
              <thead>
              </thead>
              <tbody>
                {products}
              </tbody>
            </Table>
            </ToastBody>
          </Toast>
          
        </Col>
        <Col xs="6"><Gallery username ={this.props.match.params.username}/></Col>
        <Col xs="3">
          <Toast>
            <ToastHeader>
              Exhibit a New Product!
            </ToastHeader>
            <ToastBody>
              <Form>
                <FormGroup>
                  <Label for="exampleEmail">Product Name</Label>
                  <Input type="text" name="productName"  value={this.state.productName} onChange={this.handleInputChange}/>
                </FormGroup>
                <FormGroup>
                  <Label for="examplePassword">Photo</Label>
                  <Input type="text" name="photo"  placeholder="as url" value={this.state.photo} onChange={this.handleInputChange}/>
                </FormGroup>
                <FormGroup>
                  <Label for="examplePassword">Cost</Label>
                  <Input type="text" name="cost" value={this.state.cost} onChange={this.handleInputChange} />
                </FormGroup>
                <FormGroup>
                  <Label for="examplePassword">Metarials</Label>
                  <Input type="text" name="metarials" value={this.state.metarials} onChange={this.handleInputChange}/>
                </FormGroup>
                <FormGroup>
                  <Label for="exampleText">Inventors</Label>
                  <Input type="text" name="inventors"  value={this.state.inventors} onChange={this.handleInputChange}/>
                </FormGroup>
                <FormGroup>
                  <Label for="examplePassword">Option 1</Label>
                  <Input type="text" name="name1"  placeholder="name of the option" value={this.state.name1} onChange={this.handleInputChange} />
                  <Input type="text" name="val1" placeholder="value of the option" value={this.state.val1} onChange={this.handleInputChange}/>
                </FormGroup>
                <FormGroup>
                  <Label for="examplePassword">Option 2</Label>
                  <Input type="text" name="name2" placeholder="name of the option" value={this.state.name2} onChange={this.handleInputChange}/>
                  <Input type="text" name="val2" placeholder="value of the option" value={this.state.val2} onChange={this.handleInputChange}/>
                </FormGroup>
                <Button  size="sm" outline color="secondary"  block onClick = {this.submit}>Submit</Button>
              </Form>
            </ToastBody>
          </Toast>
        </Col>
      </Row>
    </Container>
    );
  }
}

export default UserPage;
