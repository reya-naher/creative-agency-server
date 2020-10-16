const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;

require('dotenv').config()
const app = express()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fbxpl.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('icons'));
app.use(fileUpload())

const port = 5000

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const serviceCollection = client.db("creativeAgency").collection("services");
  const reviewCollection = client.db("creativeAgency").collection("reviews");
  const adminServiceCollection = client.db("creativeAgency").collection("adminServices");
  const adminCollection = client.db("creativeAgency").collection("admins");

  app.post('/addAdmins', (req, res) => {
    const adminData = req.body;
    console.log(adminData)
    adminCollection.insertOne(adminData)
      .then(result => {
      res.send(result.insertedCount > 0)
     })
  })

  app.get('/admins', (req, res) => {
    adminCollection.find({})
      .toArray((err, documents) => {
      res.send(documents)
    })
  })

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, admins) => {
      res.send(admins.length > 0)
    })
  })

  app.post('/addReviews', (req, res) => {
    const reviewData = req.body;
    console.log(reviewData)
    reviewCollection.insertOne(reviewData)
      .then(result => {
      res.send(result.insertedCount > 0)
     })
  })

  app.get('/reviews', (req, res) => {
    reviewCollection.find({}).sort({_id:-1}).limit(3)
      .toArray((err, documents) => {
      res.send(documents)
    })
  })


  app.get('/adminServices', (req, res) => {
    adminServiceCollection.find({}).sort({_id:-1}).limit(3)
      .toArray((err, documents) => {
      res.send(documents)
    })
  })


  app.post('/addServices', (req, res) => {
    const tasks = req.body;
    console.log(tasks)
    serviceCollection.insertOne(tasks)
      .then(result => {
      res.send(result.insertedCount > 0)
     })
  })

  app.get('/services', (req, res) => {
    serviceCollection.find({email: req.query.email})
      .toArray((err, documents) => {
      res.send(documents)
    })
  })


  app.get('/servicesList', (req, res) => {
    serviceCollection.find({})
      .toArray((err, documents) => {
      res.send(documents)
    })
  })


  app.post('/adminAddService', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

      var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg,'base64')
      }

      adminServiceCollection.insertOne({ name, description, image })
        .then(result => {
            res.send(result.insertedCount > 0)   
      })     
  })




});

app.get('/', (req, res) => {
  res.send("hello world from mongodb!")
})

app.listen(process.env.PORT || port)