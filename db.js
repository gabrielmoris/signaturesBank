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

module.exports.getSignature = (id) => {
    const q =
        "SELECT * FROM users JOIN signatures ON users.id = signatures.user_id WHERE users.id = $1";
    const params = [id];
    return db.query(q, params);
};

module.exports.addSignature = (cookie, signerSignature) => {
    // console.log(signerName, signerSurname, signerSignature);
    const q = `INSERT INTO signatures (user_id, signature) Values($1,$2)
    RETURNING user_id`; //still need to add userId
    const params = [cookie, signerSignature];
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

module.exports.dataFromId = (id) => {
    const q = `SELECT users.id AS user_id, users.first AS first, users.last AS last, 
        users.email AS email, signatures.signature AS signature, 
        user_profiles.age AS age, user_profiles.url AS url, user_profiles.city AS city
        FROM users 
        LEFT JOIN signatures ON users.id = signatures.user_id 
        LEFT JOIN user_profiles ON users.id = user_profiles.user_id 
        WHERE users.id = $1`;
    const params = [id];
    return db.query(q, params);
};

module.exports.addUserProfile = (id) => {
    const q = ``
    const params = [id];
    return db.query(q, params);
}