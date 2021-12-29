// THIS FILE NOT IN USE
/*
File used in an effort to separate different Express routings into different NodeJS files.
At the moment of writing, this still under development and DOES NOT WORK.
 */
const express = require('express'),
    app = express(),
    bodyParser = require('body-parser');

// Import database functions from another file
var database = require('./DBfunctions.js');

var router = express.Router();
router.use(bodyParser.json());

//Middle ware that is specific to this router
router.use(function(req, res, next) {
    console.log('Something is happening.');
    next();
});


// METHODS
// root "/" is "http://www.domain.com/api/profiles" as determined in index.js

// Create a profile
router.post('/', (req, res) => {
    // Because of express.json() is used, req is automatically converted JSON->object
    if (req.body.FirstName && req.body.LastName && req.body.Email && req.body.Password) { // everything can be found in the request
        database.registerUserToDB(req.body.FirstName, req.body.LastName, req.body.Email, req.body.Password); // create profile

        // urlOfNewProfile = someHowRetrieved
        res.status(201); // as per instructions, REST apis should send status 201 and Location-header for a successful creation
        res.set('Location', 'urlOfNewProfile');
        res.end();
    } else {
        res.send('Something wrong with:' + req.body);
    }

});

// Update profile info
router.put('/', (req, res) => {
    database.updateUserInfo(req.name,req.lname,req.email,req.id)
});


// SEARCH FUNCTIONS
// Find a profile through email
router.get('/:email', (req, res) => {
    // With :email in the url, req.params looks now like
    // {"email": "valueOfEmail"}
    promiseOfProfile = database.getUser(req.email)

    //TODO: How to open the promise-structure and what to respond to frontend?

});

// Find a profile through :ProId
router.get('/:ProId', (req, res) => {

});

module.exports.router = router;



// GET method to /api/profiles for testing
/*
app.get('/api/profiles', function (req,res) {
    res.send('/api/profiles/ -GET-kutsu mennyt läpi')
});

// POST method to /api/profiles for testing
app.post('/api/profiles', function (req, res) {
    // Because of express.json() is used, req is automatically converted JSON->object
    database.registerUserToDB(req.body.FirstName, req.body.LastName, req.body.Email, req.body.Password);
    res.send(req.body);
});
*/