//REST APIs for managing CloudKitchen Database in MongoDB Atlas
//Import dependencies modules
const express = require('express');
const cors = require("cors");
const path = require('path');

// Create an Express.js instance
const app = express();

//Express Initialization
app.use(express.json());
app.use(cors()); // allow all origins

// Absolute path to client folder
const clientPath = path.join(__dirname, '../CST3990-Neeti-Vue');

// Serve it as static path within the web service
app.use(express.static(clientPath));

// <-- expose the assets folder to the client so that images are accessible by client
app.use(express.static('assets')); 

// connect to MongoDB
const MongoClient = require('mongodb').MongoClient;
let db;

//Ensure access is allowed under all circustances - CORS
app.use ((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

//Connect to a (remote) database with username/password
MongoClient.connect(('mongodb+srv://ss4608_db_user:mDx.M00979693@cluster0.ss5hsiv.mongodb.net'), (err, client) => {
    db = client.db('CloudKitchen');
});

//Display a message for root path to show that the API is working
app.get('/', function(request, response) {
    response.send('Select a collection, e.g. /collection/messages');
});

// Get collection name
app.param('collectionName', (request, response, next, collectionName) => {
    request.collection = db.collection(collectionName);
    return next();
});

//Retrieve all the objects from a collection
app.get('/collection/:collectionName', (request, response, next) => {
    request.collection.find({}).toArray((e, results) => {
        if (e) return next(e);
        response.send(results);
    });
});

//Post a new object into the DB - OPS is an Object Identifier
app.post('/collection/:collectionName', (request, response, next) => {
    request.collection.insert(request.body, (e, results) => {
        if (e) return next(e);
        response.send(results.ops);
    });
});

// Find a object in the collection in MongoDB by object ID
const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id', (request, response, next) => {
    request.collection.findOne({_id: new ObjectID(request.params.id)}, (e, result) => {
        if (e) return next (e);
        response.send(result);
    });
});

// Update an object in MongoDB by object ID
app.put('/collection/:collectionName/:id', (request, response, next) => {
    request.collection.updateOne(
    {_id: new ObjectID(request.params.id)},
    {$set: request.body},
    { safe: true, multi: true },
    (e, result) => {
        if (e) return next (e)
        response.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'});
    });
});

//Delete an object in MongoDB
app.delete('/collection/:collectionName/:id', (request, response, next) => {
    request.collection.deleteOne(
    {_id: new ObjectID(request.params.id)}, (e, result) => {
        if (e) return next (e)
        response.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
    });
});

// Environmental Port of the system, allows to listen
const port = process.env.PORT || 3000;

// Initialize server
app.listen(port, () => {
    console.log('Express.js server is running on localhost:3000');
    console.log('Client Path = ', clientPath);
});
