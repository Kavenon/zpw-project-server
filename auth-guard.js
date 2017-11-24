var admin = require("firebase-admin");

function guard(req){
    if(!req.query.auth){
        return Promise.reject();
    }
    return admin.auth().verifyIdToken(req.query.auth)

}

module.exports = guard;