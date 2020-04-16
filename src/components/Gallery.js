import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { Row, Container} from 'reactstrap';
import {
    Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle
  } from 'reactstrap';
  import { Button , Input, InputGroup, InputGroupAddon, Col} from 'reactstrap'; 
import {
  Stitch,
  RemoteMongoClient,
  AnonymousCredential
} from "mongodb-stitch-browser-sdk";

class Gallery extends Component {

  constructor(props) {
    super(props);

    this.state = {
        users: null,
        gallery: [],
        rate: 1,
        username: ""
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
    const ratings = this.db.collection("ratings");
    this.setState({users:users})
    users
      .find({})
      .asArray()
      .then(users => {
        var gallery = []
        var gallery2 = []
        var user
        for(user of users){ 
            var product      
            for(product of user.gallery){
                product.username = user.username
                gallery.push(product)
            }
        }
        gallery.map(product =>{
            return ratings.find({productName: product.productName}).asArray().then(result =>{
              var total = 0
              var a = 0
              for(var res of result){
                for(var rate of res.ratings){
                  a = a +1;
                  total = total + parseInt(rate.rate);
                }
              }
              product.rating = a === 0 ?  a: total/a
              gallery2.push(product)
              this.setState({gallery: gallery2})
              return(product)
            })
        })
        
        
      })
      .catch(err => {
        console.warn(err);
      });
  }

  componentDidMount(){
    
    this.setState({username: this.props.username});
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
      rate: event.target.value
    });
  }

  submit(event){
    console.log(event)
    const ratings = this.db.collection("ratings");
    
    ratings.updateOne({
      owner_id: this.app.auth.user.id,
      productName : event
    },
    { "$pull": { 
        "ratings": {
          "username": this.state.username,
        }
      }},
      {
        upsert: true
      }
      ).then(res=>{
      console.log(res);
      ratings.updateOne({
        owner_id: this.app.auth.user.id,
        productName : event
      },
      { "$addToSet": { 
          "ratings": {
            "username": this.state.username,
            "rate": this.state.rate
          }
        }}
        ).then(res=>{
        console.log(res);
        window.location.reload(true); 
      })
      .catch(console.error)
    })
    .catch(console.error)
    
  }


  render() {
    let gallery = this.state.gallery === null ? null : this.state.gallery.map((product, index) => {
        return (
        <div key = {index}>
        <Card >
            <CardImg top width="100%" src={product.photo} alt="Card image cap" />
            <CardBody className="text-center">
            <CardTitle>{product.productName}</CardTitle>
            <CardSubtitle>Inventors: {product.inventors}</CardSubtitle>
            <CardText>
                Metarials: {product.metarials}
                <br/>
                Cost: {product.cost}
                <br/>
                {product.option1.name.length === 0 ? (null): (
                    <sub>
                        {product.option1.name} : {product.option1.val}
                        <br/>
                    </sub>
                )}
                {product.option2.name.length === 0 ? (null): (
                    <sub>
                        {product.option2.name} : {product.option2.val}
                        <br/>
                    </sub>
                )}
            </CardText>
            {product.username === this.state.username ? (
                null
            ) : (
                <InputGroup>
                    <Input type="select" name="rate" value={this.state.rate} onChange={this.handleInputChange}>
                        <option value ="1" >1</option>
                        <option value ="2" >2</option>
                        <option value ="3" >3</option>
                        <option value ="4" >4</option>
                        <option value ="5" >5</option>
                    </Input>
                    <InputGroupAddon addonType="prepend"><Button value={product.productName} onClick = {() => this.submit(product.productName)}>Rate this invention</Button></InputGroupAddon>
                </InputGroup>
            )}
            <Row>
              <Col className="text-left">
                <sub>rating: {product.rating}</sub>
              </Col> 
              <Col className="text-right" >
                <sub>Uploaded by {product.username === this.state.username ? "you": product.username}</sub>
              </Col>
            </Row>
            </CardBody>
        </Card>
        <br/>
        </div>
        );
    });
    return (
      <Container>
        <Row>
            {gallery}
        </Row>
      </Container>
    );
  }
}

export default Gallery;
