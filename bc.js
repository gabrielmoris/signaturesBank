const bcrypt = require("bcryptjs");
let { genSalt, hash, compare } = bcrypt;

module.exports.compare = compare;
module.exports.hash = (plainTextPw) =>
    genSalt().then((salt) => hash(plainTextPw, salt));

//DEMO

// //genSalt creates salt for the password
// genSalt()
//     .then((Salt) => {
//         console.log("Salt: ", Salt);
//         //hash expects to be given a cleartext password and a salt
//         return hash("password123.", Salt);
//     })
//     .then((hashedPW) => {
//         console.log("hashed password: ", hashedPW);
//         //compare takes 2 arguments: cleartext password and a hash and returns a boolean
//         return compare("password123.", hashedPW);
//     })
//     .then((matchValue) => {
//         console.log("Does it match? ", matchValue);
//     });
