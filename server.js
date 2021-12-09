const PORT = 8080;
const express = require("express");
const app = express();
const db = require("./db");
const { engine } = require("express-handlebars");
const cookieParser = require("cookie-parser");
const path = require("path");

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded());

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.get("/signatures", (req, res) => {
    db.getSignature()
        .then(({ rows }) => {
            console.log("results.rows", rows);
        })
        .catch((err) => console.log("err in getSignature", err));
    res.render("signers", {
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    const data = req.body;

    db.addSignature(data.first, data.last, data.signature)
        .then(() => {
            console.log("signature added");
        })
        .catch((err) => console.log("signature not added: ", err));
    res.redirect("/thanks");
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {
        layout: "main",
        results: db.getSignature().then(({ rows }) => {
            console.log("results.rows", rows);
        }),
    });
});
app.listen(PORT, () => {
    console.log(
        `Petition server is listenning 👂)))\n\nHERE------>   http://localhost:${PORT}`
    );
});
