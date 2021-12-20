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
//MIDDLEWARE_______________________________________________________________________
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
//TEST COOKIES_______________________________
// app.use((req, res, next) => {
//     console.log(req.url);
//     console.log("cookie", req.session);
//     next();
// });
//PETITION________________________________________________________________________

app.get("/petition", (req, res) => {
    if (req.session.userId) {
        if (req.session.auth) {
            res.redirect("/thanks");
        } else {
            res.render("petition", {
                layout: "main",
            });
        }
    } else {
        return res.redirect("/register");
    }
});

app.post("/petition", (req, res) => {
    const data = req.body;
    db.addSignature(req.session.userId, data.signature)
        .then((row) => {
            req.session.canvas = row.rows[0].id;
            req.session.auth = true;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("signature not added: ", err);
            res.render("petition", { error: true });
        });
});
//________________________________________________________________________________

//SIGNATURES______________________________________________________________________
app.get("/signatures", (req, res) => {
    if (req.session.auth) {
        db.getAllSignatures()
            .then(({ rows }) => {
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
//________________________________________________________________________________

//THANKS__________________________________________________________________________
app.get("/thanks", (req, res) => {
    arrResult = [];
    if (req.session.userId) {
        db.getSignature(req.session.userId)
            .then(({ rows }) => {
                // console.log(rows);
                if (rows.length) {
                    arrResult.push(rows[0].signature);
                    arrResult.push(rows[0].first);
                } else {
                    return res.redirect("/petition");
                }
                // return arrResult;
                return db.getNumberSignatures();
            })
            .then((number) => {
                arrResult.push(number.rows[0].count);
                return arrResult;
            })
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
        return res.redirect("/petition");
    }
});

//REGISTER________________________________________________________________________

app.get("/register", (req, res) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        res.render("register", { layout: "main" });
    }
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
        })
        .catch((err) => {
            console.log("Error ading User: ", err);
            res.render("register", { error: true });
        });
});
//________________________________________________________________________________

//LOGIN___________________________________________________________________________
app.get("/login", (req, res) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        res.render("login", { layout: "main" });
    }
});
app.post("/login", (req, res) => {
    const data = req.body;

    db.getUser(data.email)
        .then(({ rows }) => {
            return rows[0];
        })
        .then((results) =>
            compare(data.password, results.password).then((match) => {
                if (match === true) {
                    req.session.userId = results.id;
                    db.didSign(results.id).then((didSignResults) => {
                        if (didSignResults.rows.length === 0) {
                            req.session.auth = false; /////ADDED15/12/2021
                            res.redirect("/petition");
                        } else {
                            req.session.auth = true;
                            res.redirect("/thanks");
                        }
                    });
                } else {
                    res.render("login", { error: true });
                }
            })
        )
        .catch((err) => {
            console.log("Error adding User: ", err);
            res.render("login", { error: true });
        });
});
//________________________________________________________________________________

//PROFILE_________________________________________________________________________
app.get("/profile", (req, res) => {
    if (req.session.userId) {
        res.render("profile");
    } else {
        res.redirect("/register");
    }
});

app.post("/profile", (req, res) => {
    const data = req.body;
    let urlUser;
    if (data.urlpage != "") {
        if (data.urlpage.startsWith("http")) {
            urlUser = data.urlpage;
        } else {
            urlUser = `https\://${data.urlpage}`;
        }
    }
    db.addUserProfile(data.age, urlUser, data.city, req.session.userId)
        .then(() => res.redirect("/petition"))
        .catch((err) => {
            console.log("Error in adding data to profile: ", err);
            res.render("profile", { error: true });
        });
});

app.get(`/profile/edit`, (req, res) => {
    if (req.session.userId) {
        db.dataFromId(req.session.userId).then(({ rows }) => {
            row = rows[0];
            res.render("edit", {
                layout: "main",
                data: row,
            });
        });
    } else {
        res.redirect("/register");
    }
});

app.post(`/profile/edit`, (req, res) => {
    if (!req.body.password) {
        const data = req.body;
        let urlUser;
        if (data.urlpage != "") {
            if (data.urlpage.startsWith("http")) {
                urlUser = data.urlpage;
            } else {
                urlUser = `https\://${data.urlpage}`;
            }
        }
        console.log(urlUser);
        db.editUser(data.first, data.last, data.email, req.session.userId)
            .then(() =>
                db.editUserData(
                    data.age,
                    urlUser,
                    data.city,
                    req.session.userId
                )
            )
            .then(() => res.redirect("/petition"));
    } else {
        const data = req.body;
        const userPw = data.password;
        hash(userPw).then((hashedPw) => {
            db.editPassword(hashedPw, req.session.userId).then(() => {
                db.editUser(
                    data.first,
                    data.last,
                    data.email,
                    req.session.userId
                )
                    .then(() =>
                        db.editUserData(
                            data.age,
                            urlUser,
                            data.city,
                            req.session.userId
                        )
                    )
                    .then(() => res.redirect("/petition"));
            });
        });
    }
});
//________________________________________________________________________________

/////////////////////////
// app.post("/delete-user", (req, res) => {
//     db.deleteSignature(req.session.userId)
//         .then(() => db.deleteUser(req.session.userId))
//         .then(() => {
//              req.session = null;
//             res.redirect("/register");
//         });
// });
app.post("/delete-signature", (req, res) => {
    db.deleteSignature(req.session.userId).then(() => {
        req.session.auth = false;
        res.redirect("/petition");
    });
});

app.get(`/logout`, (req, res) => {
    req.session = null;
    res.redirect("/register");
});

app.get("/", (req, res) => {
    res.render("home", {
        layout: "main",
    });
});
/////////////////////////
if (require.main == module) {
    app.listen(PORT, () => {
        console.log(`Petition server is listenning 👂)))`);
    });
}

module.exports.app = app;
