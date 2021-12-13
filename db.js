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

module.exports.addSignature = (signerSignature) => {
    // console.log(signerName, signerSurname, signerSignature);
    const q = `INSERT INTO signatures (signature) Values($1)
    RETURNING user_id`; //still need to add userId
    const params = [signerSignature];
    return db.query(q, params);
};

module.exports.addUser = (
    signerName,
    signerSurname,
    signerEmail,
    signerPasword
) => {
    const q = `INSERT INTO users (first, last, email, password) Values($1,$2,$3,$4)
    RETURNING id, first, password`;
    const params = [signerName, signerSurname, signerEmail, signerPasword];
    return db.query(q, params);
};

module.exports.getUser = (email) => {
    const q = "SELECT email, password, id FROM users WHERE email = $1";
    const params = [email];
    return db.query(q, params);
};

module.exports.didSign = (id) => {
    const q = "SELECT signature FROM signatures WHERE user_id = $1";
    const params = [id];
    return db.query(q, params);
};

// module.exports.requestData = ()=>{
//     const q = "HOLA"
// }
//REMEMBER EVERY DAY!
//sudo service postgresql start
