let TokenHandler = require('./token_handling/TokenHandler');
const multer = require('multer');
const upload = multer({dest:'./src/img/profilePics'});
let Middleware = require('./middleware');



    /**
     * A variable containing the Express-module for pathing connections to back end. Pathing requires instancing this with constructor x = express()
     * @type {createApplication}
     */
const express = require('express'),

    /**
     * An express object for using Express functionality.
     */
    app = express(),

    /**
     * From BodyParser homepage:
     * "Node.js body parsing middleware. Parse incoming request bodies in a middleware before your handlers, available under the req.body property."
     * Automatically turns ALL REQUEST JSON data and/or URLencoded data into a JS object, so that evey path does not need to do this individually.
     * @type {Parsers|*}
     */
    bodyParser = require('body-parser'),

    /**
     * Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
     * @type {cookieParser}
     */
    cookieParser = require('cookie-parser'),
    middleware = new Middleware(),
    tokenHandler = new TokenHandler();


app.use(cookieParser());


/**
 * A variable to save the server port Node should observer for HTTP requests.
 * @type {number}
 */
const port = 63342;

//

/**
 * All request bodies will we automatically converted from json-string INTO json-object
 */
app.use(bodyParser.json());

/**
 * Import functions for database CRUD operations
 * @type {{getCalendarId, getUser, updateProfilePrivacy, updateCalPrivacy, updateNotifications, deleteCategory, getUserInfoForDocument, deleteAccountAndAssociations, addEvent, getCalendarEvents, deleteEventAndInvitees, updateUserInfo, addEntry, checkPassword, checkUserCredentials, createCategory, getCalendarEntries, registerUserToDB}|*}
 */
let database = require('./DBfunctions.js');

// React static entry points
app.use('/app', express.static('build', {index: 'index.html'}));
app.use('/', express.static('build', {index: 'login.html'}));
app.use('/register', express.static('build', {index: 'register.html'}));
app.use('/verify', express.static('build', {index: 'verify.html'}));


/* API INTERFACE
    The following part of code handles all the HTTP methods and URLs we want client connections to be able to use in the service
    Main methods used here are GET, PUT, POST, DELETE combined with their possible URL paths

    These are sectioned to resources provided by the API:
    PROFILES, SETTINGS, CONTACTS, CALENDARS, ENTRIES, EVENTS

 */

// If we want to separate route for /profiles into a separate .js file (UNFINISHED, DOESN'T WORK)
//app.use('/api/profiles', require('./routeProfiles'));


// PROFILES
// GET (return data)
// Find a profile through query parameter ?key=value, eg. ?email=john.smith@gmail.com
// Todo: Instead of querytype parameters, do search through Express placeholder parameters /profiles/:FirstName
// This is separate from the RESTful GET /profiles/:AccId
app.get('/profiles', middleware.addAccountIdToRequest, async (req, res) => {

    // Looking for other users
    // If the get-request has a query part in it (/?key=value&key=value)
    if (!(Object.entries(req.query).length === 0 && req.query.constructor === Object)){
        if ("email" in req.query) { // if query has a key "email"
            try {
                let profile = await database.getUser(req.query.email);
                let json = JSON.stringify(profile);
                res.send(json);
            } catch(e) {
                //
                res.send(JSON.stringify(e));
            }
        } else { // Query has no key "email"
            let reply = {"Response: ":"No email in query." };
            res.send(JSON.stringify(reply));
        }
    } else{ // Query empty: Looking for user's own profile data
        try {
            console.log('Looking for users own data in app.get(profiles)...');
            let profile = await database.getProfileByAccId(req.app.locals.accId);
            let json = JSON.stringify(profile);
            console.log('Looking for users own data:' + json);
            res.send(json);
        } catch(e){
            let reply = {"Response: ":"Profile data acquisition failed"};
            res.send(JSON.stringify(reply));
        }
    }
});

// GET (return data)
// Profile data through Account Id of the current user
app.get('/profiles/', (req, res) => {
    // Account Id of the current user at req.accId because of middleware addAccountIdToRequest()
    var data = database.getUserInfoForDocument(req.accId);
    var json = JSON.stringify(data);
    return res.send('json');
});

// POST (create)
app.post('/profiles', (req, res) => {
    // Because bodyparser is used, POST body content is automatically converted from JSON into a keyed list req.body
    if (req.body.FirstName && req.body.LastName && req.body.Email && req.body.Password) {
        var mail = require('./mailing.js');

        try {
            database.registerUserToDB(req.body.FirstName, req.body.LastName, req.body.Email, req.body.Password); // create profile

            // Todo: registerUserToDB should return AccId of the created account so we may use it later
            // urlOfNewProfile = someHowRetrieved
            res.status(201); // as per instructions, REST apis should send status 201 and Location-header for a successful creation
            res.set('Location', 'urlOfNewProfile');

            // Send verification email
            mail.registryMail(req.body.Email);
            res.send(JSON.stringify(true));

        } catch (error){
            res.send(JSON.stringify(false));
        }

    } else {
        res.send(JSON.stringify('Something wrong with:' + req.body));
    }

});

// PUT (update)
app.put('/profiles/', middleware.addAccountIdToRequest, (req, res) => {
    // PUT parameters can be found from keyed list req.body (after going through bodyparser middleware)
    // AccId can be found from req.locals.accId, because middleware adds that to the request.
    let name = req.body.name;
    let lname = req.body.lname;
    let email = req.body.email;
    let result = database.updateUserInfo(name,lname,email,req.app.locals.accId);
    res.send(JSON.stringify(result));
});

// SETTINGS
// Update
app.put('/settings/', (req, res) => {
    // PUT parameters can be found from keyed list req.body (after frontend JSON string has gone through the bodyparser middleware)
    // AccId can be found at req.app.locals.accId after middleware inputs it to the request.
    // Todo: Perform update, return if update was successful (true) or not (false)
    var data = true;
    var json = JSON.stringify(data);
    return res.send('json');
});

// Return all settings of one account
app.get('/settings/', (req, res) => {
    // AccId can be found at req.app.locals.accId after middleware inputs it to the request.
    //Todo: Return account settings as {key:value} list into variable 'data'
    var data = {"Setting1": "Value1", "Setting2":"Value2"};
    var json = JSON.stringify(data);
    return res.send('json');
});

// POST is not used with SETTINGS


// CONTACTS (completely unfinished
// GET (return data)
app.get('/contacts/:AccId', (req, res) => {
    // AccId can be found at keyed list req.params with req.params.AccId  (taken from :AccId at the URL)
    // Todo: Return contacts from Account in what kind of form, and what data?
    var data = {"key1": "value1", "key2":"value2"};
    return res.send(JSON.stringify(data));
});

// PUT (update)
app.put('/contacts/:AccId', (req, res) => {
    // AccId can be found at keyed list req.params with req.params.AccId  (taken from :AccId at the URL)
    // PUT parameters can be found from keyed list req.body (after frontend JSON string has gone through the bodyparser middleware)
    // Todo: Actually update a contact. Is this even necessary?

});

// POST (create)
app.post('/contacts/:AccId', (req, res) => {
    // AccId can be found at keyed list req.params with req.params.AccId  (taken from :AccId at the URL)
    // POST parameters can be found from keyed list req.body (after frontend JSON string has gone through the bodyparser middleware)
    // Todo: Actually add an account to contacts. Return true if successful, false if not.
    let data = true;
    return res.send(JSON.stringify(data));

});

// DELETE
app.delete('/contacts/:AccId', (req, res) => {
    // AccId can be found at keyed list req.params with req.params.AccId  (taken from :AccId at the URL)
    // DELETE parameters can be found from keyed list req.body (after frontend JSON string has gone through the bodyparser middleware)
    // Todo: Actually remove an account from contacts. Return true if sucessful, false if not
    let data = true;
    return res.send(JSON.stringify(data));
});

// CALENDARS
// Do we have need to return individual calendar-objects in addition to there beind separate routes to entries, events, notes?
// GET (return data)
// PUT (update)
// POST not used with CALENDARS
//app.post('/calendars/')


// ENTRIES
// GET (return data)
app.get('/entries', middleware.addAccountIdToRequest, async (req, res) => {

    //console.log(req.query);
    let accId = req.app.locals.accId;
    let sdate = req.query.sdate;
    let edate = req.query.edate;

    let entries = await database.getCalendarEntries(accId, sdate, edate);
    let jsonEntries = JSON.stringify(entries);
    res.send(jsonEntries);
    // Todo: A separate GET-route to have more parameters (date/time scopes for searching)

});

// PUT (update)
app.put('/entries', (req, res) => {
    // AccId can be found at keyed list req.params with req.params.AccId  (taken from :AccId at the URL)
    // PUT parameters can be found from keyed list req.body (after frontend JSON string has gone through the bodyparser middleware)
    // Todo: Actually update an entry. Return true if successful, false if not.
    let json = JSON.stringify(data);
    return res.send(json);
});

// POST (create)
app.post('/entries/', middleware.addAccountIdToRequest, async (req, res) => {
    // POST parameters can be found from keyed list req.body (after frontend JSON string has gone through the bodyparser middleware)
    let result = await database.addEntry(req.app.locals.accId,req.body.name,req.body.date,req.body.time,req.body.rem,req.body.cat);
    return res.send(JSON.stringify(result));
});

// DELETE
app.delete('/entries/:AccId', (req, res) => {
    // AccId can be found at keyed list req.params with req.params.AccId  (taken from :AccId at the URL)
    // DELETE parameters can be found from keyed list req.body (after frontend JSON string has gone through the bodyparser middleware)
    // Todo: Actually remove an account from contacts. Return true if successful, false if not.
});


// EVENTS
// GET (return data)
app.get('/events/', middleware.addAccountIdToRequest, async (req, res) => {

    let accId = req.app.locals.accId;
    let sdate = req.query.sdate;
    let edate = req.query.edate;
    let events = await database.getCalendarEvents(accId, sdate, edate);
    res.send(JSON.stringify(events));
});

//GET GROUP-EVENTS (return data)
app.get('/group-events/', middleware.addAccountIdToRequest, async (req, res) => {
    console.log(req.query);
    let memberIds = req.query.members;
    memberIds.remove(memberIds.remove(memberIds.indexOf(req.app.locals.accId)));
    console.log(memberIds);
    let sdate = req.query.sdate;
    let edate = req.query.edate;
    let groupEvents = await database.getGroupEvents(memberIds, sdate, edate);
    res.send(JSON.stringify(groupEvents))
});

// PUT (update)
app.put('/events', middleware.addAccountIdToRequest,async(req, res) => {
    // AccId can be found at req.locals.accId
    // PUT parameters can be found from keyed list req.body (after frontend JSON string has gone through the bodyparser middleware)

    let data = true;
    return res.send(JSON.stringify(data));
});

// POST (create)
app.post('/events/',middleware.addAccountIdToRequest, async (req, res) => {
    // AccId can be found at req.localsh.accId
    // POST parameters can be found from keyed list req.body (after frontend JSON string has gone through the bodyparser middleware)
    // Suffers from long parameter list
    let result = await database.addEvent(req.body.name,req.body.sdate,req.body.edate,req.body.stime,req.body.etime,req.body.venue,
        req.body.info,req.body.pri,req.body.rep,req.app.locals.accId,req.body.cat,req.body.people);
    return res.send(JSON.stringify(result));
});

// DELETE
app.delete('/events/',middleware.addAccountIdToRequest,async (req, res) => {
    // AccId can be found at keyed list req.params with req.params.AccId  (taken from :AccId at the URL)
    // DELETE parameters can be found from keyed list req.body (after frontend JSON string has gone through the bodyparser middleware)
    // Todo: Actually remove an event. Return true if successful, false if not.
    let data = true;
    return res.send(JSON.stringify(data));
});


// LOGIN
/*
This route handles user login. It receives a POST request with an Authorization header formed in front end with
ajaxRequest.setRequestHeader("Authorization", header);
Where header = "Basic " + [Base64 encoded string of "email@email.com:password"]
 */
app.post('/loginUser', tokenHandler.login, (req, res) => {
});

// VERIFY USER
// Path which accepts
app.get('/verifyUser', (req, res) => {
    var authString = (new Buffer(req.headers.authorization.split(" ")[1], 'base64').toString());
    var authArray = authString.split(":");
    var email = authArray[0];
    var password = authArray[1];
    var credentialsOk;

    // Send "true" if credentials ok, false if not
    var result = database.checkUserCredentials(email,password).then(userOK=>{
        if(userOK){
            //console.log('käyttäjä ja salasana ok, kirjaudutaan sisään');
            credentialsOk = true;
            //Todo: Change Verified flag in database from False to True
            res.send(userOK);
        }else{
            //console.log('käyttäjä tai salasana väärin');
            credentialsOk = false;
            res.send(userOK);
        }

    });
});

// GET /logout
app.get('/logout', function(req, res, next) {
    res.clearCookie(database.getProfileByAccId(req.app.locals.accId).email);
    res.redirect('/');
});

// Todo: middleware.requiresLogin;
app.get('/profileSearch', async (req,res) => {
   console.log(req.query.searchString);
   let result = await database.getUsers(req.query.searchString);
   console.log(result);
   res.send(JSON.stringify(result));
});


// GROUPS
// GET (return data)
app.get('/groups/', middleware.addAccountIdToRequest, async (req, res) => {
    let accId = req.app.locals.accId; // Account ID of the logged in user
    let data = await database.getMyGroups(accId);
    res.send(JSON.stringify(data)); // Response back to frontend

});

// PUT (update)
app.put('/groups/', middleware.addAccountIdToRequest, async (req, res) => {
    let accId = req.app.locals.accId; // Account ID of the logged in user

    // Request parameters in req.body.parameter
    // let parameter1 = req.body.parameter1;

    // Todo: code to update data about a group

    let data = {placeholder: "placeholder"};
    res.send(JSON.stringify(data)); // Response back to frontend
});



// POST (create)
app.post('/groups/', middleware.addAccountIdToRequest, async (req, res) => {
    let accId = req.app.locals.accId; // Account ID of the logged in user

    let data = await database.createGroup(req.body.GroupObject,accId);
    res.send(JSON.stringify(data)); // Response back to frontend
});

// DELETE
app.delete('/groups/', middleware.addAccountIdToRequest, async (req, res) => {

    let accId = req.app.locals.accId; // Account ID of the logged in user

    // Request parameters in req.body.parameter
    // let parameter1 = req.body.parameter1;
    // Todo: code to delete a group

    let data = {placeholder: "placeholder"};
    res.send(JSON.stringify(data)); // Response back to frontend
});

//MEMBERS

app.get('/members/', middleware.addAccountIdToRequest, async (req, res) => {
    let accId = req.app.locals.accId; // Account ID of the logged in user

    let data = await database.getMemberProfiles(req.query.GanID);
    console.log(JSON.stringify(data));
    res.send(JSON.stringify(data)); // Response back to frontend

});

app.post('/app/pic/',upload.single('avatar'),function(req,res,next){
    console.log('teen tätä');
   console.log(req.file);
});


//CONTACTS
app.post('/contacts/',middleware.addAccountIdToRequest,async(req,res)=>{
   let accId=req.app.locals.accId;
    let data = await database.addContact(req.body.contactId,accId);
    res.send(JSON.stringify(data)); // Response back to frontend
});

app.get('/contacts/',middleware.addAccountIdToRequest,async(req,res)=>{
   let accId=req.app.locals.accId;
   let data=await database.getContactProfiles(accId);
   var json=JSON.stringify(data);
   console.log(json);
   res.send(json);
});

app.put('/notifications/', middleware.addAccountIdToRequest, (req, res) => {
    // PUT parameters can be found from keyed list req.body (after going through bodyparser middleware)
    // AccId can be found from req.locals.accId because our middleware addAccountIdToRequest() adds that to the request.
    let settingID=req.app.locals.accId;
    //con,gan,eve,ans,rem, setId
    let con = req.body.conNot;
    let gan = req.body.ganNot;
    let eve = req.body.eveNot;
    let ans=req.body.ansNot;
    let rem=req.body.remNot;

    let result = database.updateNotifications(con,gan,eve,ans,rem,settingID);

    res.send(JSON.stringify(result));


});

app.put('/privacy/', middleware.addAccountIdToRequest, (req, res) => {
    // PUT parameters can be found from keyed list req.body (after going through bodyparser middleware)
    // AccId can be found from req.locals.accId because our middleware addAccountIdToRequest() adds that to the request.
    let accId=req.app.locals.accId;

    let pro=req.body.pro;
    let cal=req.body.cal;

    let result = database.updatePrivacy(accId,pro,cal);

    res.send(JSON.stringify(result));


});

app.post('/category',middleware.addAccountIdToRequest,async (req,res)=>{
    let accId = req.app.locals.accId; // Account ID of the logged in user

    let data = await database.createCategory(req.body.name,accId);
    res.send(JSON.stringify(data));
});

app.get('/category',middleware.addAccountIdToRequest,async (req,res)=>{
    let accId = req.app.locals.accId; // Account ID of the logged in user

    let data = await database.getMyCategories(accId);
    console.log(JSON.stringify(data));
    res.send(JSON.stringify(data));
});

app.delete('/category',middleware.addAccountIdToRequest,async (req,res)=>{
   let accId=req.app.locals.accId;
   let data=await database.deleteCategory(req.body.name,accId);
    console.log(JSON.stringify(data));
    res.send(JSON.stringify(data));

});


// Finally node listens to a port
app.listen(port, () => console.log(`Moiccu app listening on port ${port}!`));

