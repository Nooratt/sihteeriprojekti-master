let jwt;
let config;
let database;
let cookieParser;

/**
 * Class holds methods for handling JWTs (JSON Web Tokens)
 */
class TokenHandler {

    constructor() {
        jwt = require('jsonwebtoken');
        config = require('./config');
        database = require('../DBfunctions');
        cookieParser = require('cookie-parser');
    }

    /**
     * Encode a character string into Base64
     * @param str: String to encode
     * @returns {string}: Encoded string
     */
    atob(str){
        return Buffer.from(str, 'base64').toString('binary');
    }

    /**
     * Decode a string from Base64 into character String.
     * @param str: Base64 encoded String to decode
     * @returns {string}: Decoded character String
     */
    btoa(str) {
        return Buffer.from(str, 'binary').toString('base64');
    }

    /**
     * Disseminates the request authorization header to return a JWT.
     * @param authHeader: Request authorization header content given from upper level
     * @returns {null | String} Null, if no bearer token present in request. Jwt String if token present.
     */
    getBearerToken(authHeader) {
        if(authHeader){
            let headerTable = authHeader.split(" ");
            console.log('Header table: ' + headerTable);
            // Authorization header does not contain "Bearer token"
            if (headerTable.indexOf("Bearer") == -1) {
                return null;
            } else if (headerTable.length < 2) {
                return null;
            } else {
                return headerTable[headerTable.indexOf("Bearer") + 1];
            }
        }
    }

    /**
     * Function should probably be split between here and Middleware class -
     * If user login is successful, creates
     * @param req: Request object automatically created. Given here so method is able to modify it.
     * @param res: Response object autmatically created. Given here so metod is able to modify it.
     * @returns {String} Created JWT. Sends a failure response directly if not successful.
     */
    async login(req, res) {
        if (req.headers.authorization) {

            // Split the string at a whitespace, e.g "Basic 2r2398r7e9a7f9e7w9r07nv" and decode the r23879r7ew9rn9w797 into authString --> email@email.com:password
            var authString = (new Buffer(req.headers.authorization.split(" ")[1], 'base64').toString());
            // Separate email@email.com and password into variables
            var authArray = authString.split(":");
            var email = authArray[0];
            var password = authArray[1];


            if (await database.checkUserCredentials(email, password)) {
                let token = jwt.sign({email: email}, // (payload, secretKey, signOptions)
                    config.secret,
                    {
                        expiresIn: '24h',
                        issuer: "Moiccu"
                        // other options for signing go here
                    });

                // signOptions still missing audience (provided by the client at login)
                // audience needs to match at verification
                // more: https://medium.com/@siddharthac6/json-web-token-jwt-the-right-way-of-implementing-with-node-js-65b8915d550e

                // return the JWT token for the future API calls
                res.cookie("MoiccuKeksi", {email:email, token: token, maxAge: 900000}); // (cookieName, cookieValue)
                console.log('Created cookie: ' + res.cookie);
                res.json({
                    success: true,
                    message: 'Authentication successful!',
                    token: token
                });
            } else {
                res.status(403).json({
                    success: false,
                    message: 'Incorrect username or password'
                });
            }
        }
    }

    /**
     * Function uses the jwt library to verify a given token
     * @param token: String JWT to verify
     * @param res: Given so function can send a direct response in case of error.
     * @returns {Int} Account Id for the email in the token
     */
    async verifyTokenAndGetUID(token, res) {

        // Failure, if no token present
        if (!token) {
            res.json({
                success: false,
                message: "No token in request."
            })
        }


        let tokenTable = token.toString().split(".");
        let tokenObject = {header: tokenTable[0], payload: tokenTable[1], signature: tokenTable[2]};
        // console.log('TokenObject: ' + tokenObject.header + tokenObject.payload + tokenObject.signature);

        let verifyOptions = {
            issuer:  "Moiccu",
            //subject:  s,
            //audience:  a,
            expiresIn:  "24h",
            algorithm:  ["RS256"]
        };

        let legit = jwt.verify(token, config.secret, verifyOptions);
        console.log("\nJWT verification result: " + JSON.stringify(legit));
        console.log(legit.email);

        try{
            if (legit.email) {
                let user = await database.getUser(legit.email);
                console.log('User: ' + user);
                let accId = user.accountAccID;
                console.log('Account ID: ' + accId);
                return accId;
            } else {
                res.json({
                    success: false,
                    message: "No email in jwt-token."
                })
            }

        } catch (err){
            res.json({
                success: false,
                message: "Error when extracting email from jwt-token."
            })

        }

    }
}

module.exports = TokenHandler;