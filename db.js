//db.js ONLY for database

const spicedPg = require("spiced-pg");

const database = "petition"; //<---this is the database I already have in my PC
const username = "onionpetition";
const password = "onion";

//communication with the database
const db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

console.log(`[db] connecting to: ${database}`);

module.exports.getSignature = () => {
    const q = "SELECT * FROM signatures";
    return db.query(q);
};

module.exports.addSignature = (signerName, signerSurname, signerSignature) => {
    // console.log(signerName, signerSurname, signerSignature);
    const q = `INSERT INTO signatures (first, last, signature) Values($1,$2,$3)
    RETURNING id, first`;
    const params = [signerName, signerSurname, signerSignature];
    return db.query(q, params);
};



// module.exports.requestData = ()=>{
//     const q = "HOLA"
// }
//REMEMBER EVERY DAY!
//sudo service postgresql start
