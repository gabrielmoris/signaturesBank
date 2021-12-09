const express = require("express");
const PORT = 8080;
const app = express();
const db = require("./db");

app.get("/signatures", (req, res) => {
    db.getSignatures()
        .then(({ rows }) => {
            console.log("results.rows", rows);
        })
        .catch((err) => console.log("err in getActors", err));
});

app.post("/add-signature", (req, res) => {
    db.addSignature("Gabriel","Chamorro")
        .then(() => {
            console.log("signature added");
        })
        .catch((err) => console.log("signature not added: ", err));
});

app.listen(PORT, () => {
    console.log(
        `Petition server is listenning 👂)))\n\nHERE------>   http://localhost:${PORT}`
    );
});
