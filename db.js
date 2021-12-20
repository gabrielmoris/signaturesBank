//db.js ONLY for database

const spicedPg = require("spiced-pg");

const database = "petition"; //<---this is the database I already have in my PC
const username = "onionpetition";
const password = "onion";

//communication with the database
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${username}:${password}@localhost:5432/${database}`
);

console.log(`[db] connecting to: ${database}`);

module.exports.getSignature = (id) => {
    const q =
        "SELECT * FROM users JOIN signatures ON users.id = signatures.user_id WHERE users.id = $1";
    const params = [id];
    return db.query(q, params);
};

module.exports.getAllSignatures = () => {
    const q = `SELECT users.id AS user_id, users.first AS first, users.last AS last, 
        users.email AS email, signatures.signature AS signature, 
        user_profiles.age AS age, user_profiles.url AS url, user_profiles.city AS city
        FROM users 
        FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id 
        INNER JOIN signatures ON users.id = signatures.user_id`;
    return db.query(q);
};

module.exports.getNumberSignatures = () => {
    const q = `SELECT COUNT(*) FROM signatures`;
    return db.query(q);
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

module.exports.addUserProfile = (signerAge, signerUrl, signerCity, userId) => {
    const q = `INSERT INTO user_profiles (age, url, city, user_id) Values($1,$2,LOWER($3),$4)`;
    const params = [signerAge || null, signerUrl, signerCity, userId];
    return db.query(q, params);
};

module.exports.getUserByCity = (city) => {
    const q = `SELECT users.id AS user_id, users.first AS first, users.last AS last, 
        users.email AS email, signatures.signature AS signature, 
        user_profiles.age AS age, user_profiles.url AS url, user_profiles.city AS city
        FROM users 
        LEFT JOIN signatures ON users.id = signatures.user_id 
        LEFT JOIN user_profiles ON users.id = user_profiles.user_id 
        WHERE user_profiles.city = $1`;
    const params = [city];
    return db.query(q, params);
};

module.exports.deleteSignature = (user_id) => {
    const q = `DELETE FROM signatures WHERE user_id = $1`;
    const params = [user_id];
    return db.query(q, params);
};

module.exports.editUser = (first, last, email, cookie) => {
    const q = `UPDATE users SET first =$1, last=$2, email=$3 WHERE users.id = $4`;
    const params = [first, last, email, cookie];
    return db.query(q, params);
};

module.exports.editUserData = (age, url, city, cookie) => {
    const q = `INSERT INTO user_profiles(age,url,city, user_id)
    VALUES($1,$2,$3,$4)
    ON CONFLICT (user_id)
    DO UPDATE SET age =$1, url = $2, city= $3`;
    const params = [age, url, city, cookie];
    return db.query(q, params);
};

module.exports.editPassword = (pass, cookie) => {
    const q = `UPDATE users
    SET password =$1
    WHERE users.id = $2`;
    const params = [pass, cookie];
    return db.query(q, params);
};


// module.exports.deleteUser = (id) => {
//     const q = `DELETE FROM users WHERE id = $1`;
//     const params = [id];
//     return db.query(q, params);
// };