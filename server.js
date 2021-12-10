const PORT = 8080;
const express = require("express");
const app = express();
const db = require("./db");
const { engine } = require("express-handlebars");
const cookieSession = require("cookie-session");
//to prevent clickjacking
app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});
// const secretcookie = require("secrets.json");

const path = require("path");

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded());
app.use(
    cookieSession({
        // secret: secretcookie.cookieSecret,
        secret: "aB3ErT5F6&5F",
        maxAge: 100 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);
app.get("/petition", (req, res) => {
    if (req.session.auth === true) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main",
        });
    }
});

app.get("/signatures", (req, res) => {
    if (req.session.auth === true) {
        db.getSignature()
            .then(({ rows }) => {
                let signers = [];
                for (let i = 0; i < rows.length; i++) {
                    let signerName = rows[i].first;
                    let signerSurname = rows[i].last;
                    signers.push(`${signerName} ${signerSurname}`);
                }
                // console.log(signers);
                return signers;
            })
            .then((signers) => {
                res.render("signers", {
                    layout: "main",
                    signatures: signers,
                });
            })
            .catch((err) =>
                console.log("Sorry, I couldnt get signatures ", err)
            );
    } else {
        res.redirect("/petition");
    }
});

app.post("/petition", (req, res) => {
    const data = req.body;

    db.addSignature(data.first, data.last, data.signature)
        .then((row) => {
            console.log("signature added", row.rows[0].id);
            req.session.canvas = row.rows[0].id;
            req.session.auth = true;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("signature not added: ", err);
            res.render("petition", { error: true });
        });
});

app.get("/thanks", (req, res) => {
    // const { signatureId } = req.session.signatureId;
    //do query to get signature using signatureId
    //pass signature back to client to render onscreen

    if (req.session.auth === true) {
        db.getSignature()
            .then(({ rows }) => {
                let arrResult = [];
                // console.log("results.rows", rows);
                arrResult.push(rows.length);
                arrResult;
                for (let y = 0; y < rows.length; y++) {
                    if (rows[y].id === req.session.canvas) {
                        arrResult.push(rows[y].signature);
                        arrResult.push(rows[y].first);
                    }
                }

                return arrResult;
            })
            .then((arrResult) => {
                res.render("thanks", {
                    layout: "main",
                    results: arrResult[0],
                    canvas: arrResult[1],
                    firstname: arrResult[2],
                });
            })
            .catch((err) =>
                console.log("Sorry, I couldnt get signatures ", err)
            );
    } else {
        res.redirect("/petition");
    }
});
//////////////////////////
app.get("/", (req, res) => {
    res.redirect("/petition");
});

/////////////////////////

app.listen(PORT, () => {
    console.log(
        `Petition server is listenning 👂)))\n\nHERE------>   http://localhost:${PORT}`
    );
});
