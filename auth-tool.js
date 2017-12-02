const admin = require("firebase-admin");

export function getUid(auth) {
    return new Promise((resolve, reject) => {
        let userp = admin.auth().verifyIdToken(auth);
        userp.then(user => {
            if (user) {
                resolve(user.uid);
            }
            else {
                resolve(null);
            }
        })
            .catch(_ => resolve(null));
    })
}