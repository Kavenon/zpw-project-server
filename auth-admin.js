var admin = require("firebase-admin");

function guard(req) {
    if (!req.query.auth) {
        return Promise.reject();
    }
    return admin
        .auth()
        .verifyIdToken(req.query.auth)
        .then(u => admin.auth().getUser(u.uid))
        .then(user => {
            if (user.displayName === 'admin')
                return Promise.resolve();
            return Promise.reject('not admin');
        });
}

module.exports = guard;