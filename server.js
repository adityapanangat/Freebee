import dotenv from "dotenv"; dotenv.config();

import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
    import "./serverside utils/strategies/localStrategy.js";
    import "./serverside utils/strategies/googleStrategy.js";


//dirName for other scripts to access
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url))
export { __dirname };

//#region emailer
import { setUpEmailer } from "./serverside utils/emailer.js";
if(setUpEmailer()) {
    console.log("Serverside -- ready to send emails")
}
else {
    console.log("Serverside -- email sending can't be configured");
    process.exit();
}
//#endregion



//basic server regulation
export function serversideIssue(issue = "Something on our end went wrong.") {
    console.log("Serverside -- ERROR: " + issue);
}


const app = express();

app.set("view engine", "ejs");
app.use(express.static("public")); //loads all static files from the public folder


// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// parse application/json
app.use(express.json());
app.use(cookieParser("helloWorld"));


app.use(
    session({
        secret: "helloWorld",
        saveUninitialized: false,
        resave: false,
        cookie: {
            maxAge: 1000 * 60 * 60, //60 seconds * 60 = 1 hour
            secure:false
        }
    })
);

import { publicRoutes } from "./routes/publicRoutes.js";
app.use(publicRoutes);

app.use(passport.initialize());
app.use(passport.session());


//routes
import { privateRoutes } from "./routes/privateRoutes.js";
app.use(privateRoutes);
    
//if not logged in through passport
app.use((err, req, res, next) => {

    if(err) {
        if(err.message === 'Forbidden') {
            res.render("pages/problemPage", { message: "Forbidden" });
        }
        else if(err.message === 'Bad request') {
            res.render("pages/problemPage", { message: "Bad request" });
        }
        else if(err.message === 'Server error') {
            res.render("pages/problemPage", { message: "Server error" });
        }
        else {
            console.log(err);
            res.render("pages/problemPage", { message: "Something went wrong." });
        }

        console.log(err);
    }

});

export function ifAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed to the next middleware or route handler
    } else {
        // Store the intended URL in the session!! **
        res.redirect('/login'); // Redirect to the login page
    }
}



//server starts listening
app.listen(3000, () => {
    console.log("Serverside -- server listening");
});


