const PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const db = require("./db");
const { engine } = require("express-handlebars");
const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc");
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
    // console.log("i am in petition:", req.session);
    if (req.session.auth) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main",
        });
    }
});

app.get("/signatures", (req, res) => {
    if (req.session.auth === true) {
        db.getAllSignatures()
            .then(({ rows }) => {
                // console.log(rows.email)
                res.render("signers", {
                    layout: "main",
                    signatures: rows,
                });
            })
            .catch((err) =>
                console.log(
                    "Sorry, I couldnt get signatures in /signatures ",
                    err
                )
            );
    } else {
        res.redirect("/petition");
    }
});

app.post("/petition", (req, res) => {
    const data = req.body;
    db.addSignature(req.session.userId, data.signature)
        .then((row) => {
            // console.log("signature added", row.rows[0].id);
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
    ///SI ENTRO DESDE LOGIN DOESNT WORK
    arrResult = [];
    if (req.session.userId) {
        db.getSignature(req.session.userId)
            .then(({ rows }) => {
                // console.log(rows);
                // arrResult.push(rows.length);
                arrResult.push(rows[0].signature);
                arrResult.push(rows[0].first);
                // return arrResult;
                return db.getNumberSignatures();
            })
            .then((number) => {
                // console.log(
                //     "i am going to ush this in arrResult",
                //     number.rows[0].count
                // );
                arrResult.push(number.rows[0].count);
                // console.log(arrResult);
                return arrResult;
            })
            // db.dataFromId(req.session.userId)
            .then((arrResult) => {
                // console.log("RESULT!:",result.rows.signature)
                res.render("thanks", {
                    layout: "main",
                    results: arrResult[2],
                    canvas: arrResult[0],
                    firstname: arrResult[1],
                });
            })
            .catch((err) =>
                console.log("Sorry, I couldnt get signatures in /thanks ", err)
            );
    } else {
        res.redirect("/petition");
    }
});

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/register", (req, res) => {
    res.render("register", { layout: "main" });
});

app.post("/register", (req, res) => {
    const data = req.body;
    const userPw = data.password;

    hash(userPw)
        .then((hashedPw) => {
            db.addUser(data.first, data.last, data.email, hashedPw)
                .then((row) => {
                    // console.log("user added", row.rows[0].id);
                    req.session.userId = row.rows[0].id;
                    // req.session.auth = true;
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("Error ading User: ", err);
                    res.render("register", { error: true });
                });
            // console.log("hashedPW: ", hashedPw);
        })
        .catch((err) => {
            console.log("Error ading User: ", err);
            res.render("register", { error: true });
        });
});

app.get("/login", (req, res) => {
    res.render("login", { layout: "main" });
});
app.post("/login", (req, res) => {
    const data = req.body;
    // console.log(data);

    //this is where I want to use the compare.
    db.getUser(data.email)
        .then(({ rows }) => {
            // console.log(rows);
            return rows[0];
        })
        .then((results) =>
            compare(data.password, results.password).then((match) => {
                if (match === true) {
                    // console.log(
                    //     "The PW written and the Pw from Db match?",
                    //     match
                    // );
                    req.session.userId = results.id;
                    db.didSign(results.id).then((didSignResults) => {
                        // console.log("didsignrows", didSignResults.rows);
                        if (didSignResults.rows.length === 0) {
                            res.redirect("/petition");
                        } else {
                            //NO ESTOY SEGURO DE ESTO
                            // console.log("user loged", req.session);
                            req.session.auth === true;
                            res.redirect("/thanks");
                        }
                    });
                }
            })
        )
        .catch((err) => {
            console.log("Error adding User: ", err);
            res.render("login", { error: true });
        });
});

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
    const data = req.body;
    // console.log(data);
    let urlUser;
    if (data.urlpage.startsWith("http")) {
        urlUser = data.urlpage;
    } else {
        urlUser = `https\://${data.urlpage}`;
    }
    db.addUserProfile(data.age, urlUser, data.city, req.session.userId)
        .then(() => res.redirect("/petition"))
        .catch((err) => {
            console.log("Error in adding data to profile: ", err);
            res.render("profile", { error: true });
        });
});

app.get("/signatures/:city", (req, res) => {
    const requestedCity = req.params.city;
    db.getUserByCity(requestedCity)
        .then(({ rows }) => {
            // console.log(rows.email)
            res.render("signers", {
                layout: "main",
                signatures: rows,
            });
        })
        .catch((err) =>
            console.log(
                "Sorry, I couldnt get signatures in /signatures/city ",
                err
            )
        );
});
/////////////////////////
// app.post("/delete-user", (req, res) => {
//     db.deleteSignature(req.session.userId)
//         .then(() => db.deleteUser(req.session.userId))
//         .then(() => {
//             req.session.auth = false;
//             req.session.userId = null;
//             res.redirect("/register");
//         });
// });
app.post("/delete-signature", (req, res) => {
    db.deleteSignature(req.session.userId).then(() => {
        req.session.auth = false;
        res.redirect("/petition");
    });
});

app.post(`/profile/edit`, (req, res) => {
    if (!req.body.password) {
        const data = req.body;
        // console.log(data);

        //2 diferent db queries, there is not update join in sql
        //user doesnt want to change the password
        //here to update all but not password
        db.editUser(data.first, data.last, data.email, req.session.userId)
            .then(() =>
                db.editUserData(
                    data.age,
                    data.urlpage,
                    data.city,
                    req.session.userId
                )
            )
            .then(() => res.redirect("/petition"));
    } else {
        //user changed the password, we modify it
        //hash this and update the table
        //here to update only the passsword
        req.body.password;
    }
});

app.get(`/profile/edit`, (req, res) => {
    db.dataFromId(req.session.userId).then(({ rows }) => {
        // console.log(rows[0]);
        row = rows[0];
        res.render("edit", {
            layout: "main",
            data: row,
        });
    });
});

/////////////////////////
app.listen(PORT, () => {
    console.log(`Petition server is listenning 👂)))`);
});
