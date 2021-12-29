let TokenHandler = require('./token_handling/TokenHandler');
let tokenHandler = new TokenHandler();

/**
 * Middleware contains functions run before certain express paths.
 * Each function must be called after eg. app.get('profiles', middlewareFunction (req,res) => {})
 */
class Middleware {
    constructor() {
    }

    /* Old hard coded middleware before jwt tokens
    addAccountIdToRequest(req, res, next) {
        if (req) {
            req.app.locals.accId = 1;
            next();
        }
    }
    */

    /**
     * Function checks request for user authorization, verifies the JWT token, and inputs the user's account id into req.app.locals.accId
     * @param req: Express automatically creates this request object, must be given as parameter from upper level
     * @param res: Express automatically creates this response object, must be given as parameter from upper level
     * @param next: We can define the next middleware function to be resolved.
     * @returns A modified response in case something is missing or the function cannot resolve through its happy path
     *
     */
    async addAccountIdToRequest(req, res, next) {
        const authHeader = req.headers.authorization;
        console.log('Auth header: ' + req.headers.authorization);

        if (!authHeader) {
            return res.status(403).json({
                status: 403,
                message: 'FORBIDDEN: Requires Authorization header'
            })
        } else {
            const token = await tokenHandler.getBearerToken(authHeader);
            console.log('Token: ' + token);
            if (token) {
                try {
                    console.log('Verifying token...');
                    let userId = await tokenHandler.verifyTokenAndGetUID(token);
                    console.log('Token verified, accountId: ' + userId);
                    req.app.locals.accId = userId;
                    next()
                } catch (err) {
                    return res.status(401).json({
                        status: 401,
                        message: 'UNAUTHORIZED'
                    })
                }
            } else {
                return res.status(403).json({
                    status: 403,
                    message: 'FORBIDDEN: Incorrect token or no token in Authorization header.'
                })
            }
        }
    }
}
module.exports = Middleware;
