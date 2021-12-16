const supertest = require("supertest");
const { app } = require("./server.js");
const cookieSession = require("cookie-session");
const { getUserByCity } = require("./db.js");
const { getSignature } = require("./db.js");
jest.mock("./db.js");

test("home page is functional", () => {
    return supertest(app).get("/register").expect(200);
});
//FIRST EXERCISE
test("redirect / to register", () => {
    return supertest(app).get("/").expect(302).expect("location", "/register");
});
//SECOND EXERCISE____________________
test("Users who are logged in and have signed the petition are redirected to the thank you page when they attempt to go to the petition page or submit a signature", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
        auth: true,
    });
    return supertest(app)
        .get("/register")
        .expect(302)
        .expect("location", "/petition");
});
//THIRD EXERCISE____________________
test("redirect to thanks if in petition I have the cookie", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
        auth: true,
    });
    return supertest(app)
        .get("/petition")
        .expect(302)
        .expect("location", "/thanks");
});
//FOURTH EXERCISE_________________
test("Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to either the thank you page or the signers page", () => {
    getSignature.mockResolvedValueOnce({
        rows: [{ userId: 1 }],
    });

    return supertest(app)
        .get("/thanks")
        .expect(302)
        .expect("location", "/petition");
});
//__________________________________
test("form submission sucessful", () => {
    return supertest(app)
        .post("/petition")
        .send("signature=kjskjsakjakjakasjakjsakjsajsijis");
});

test("get user by id", () => {
    getUserByCity.mockResolvedValueOnce({
        rows: [
            { city: "berlin" },
            { city: "berlin" },
            { city: "berlin" },
            { city: "berlin" },
        ],
    });
});
