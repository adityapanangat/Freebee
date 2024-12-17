import express from "express";
var signInRouter = express.Router();
import { addFreebeeAccount, queryDatabase, createVerificationToken } from "../serverside utils/database.js";
import { sendVerificationEmail } from "../serverside utils/emailer.js";
import passport from "passport";
import multer from "multer";
const upload = multer();



//if user requests to post at sign up location (wants to make account)
signInRouter.get("/signup", function(req, res) {
    if(req.isAuthenticated()) {
        // -- should be changed to go back to profile later
        res.redirect("/");
    }
    else {
        res.render("pages/signUp.ejs")
    }    
});


//note: /signup/local doesn't exist because it's done through email verification router

signInRouter.post("/beginVerification", upload.none(), async (req, res) => {

    try {
        //before we can send the email -- have to make sure that email isn't alerady in DB
        var accountVerified = await accountVerification(req.body.email)
        if(!accountVerified) throw new Error("Email in use");

        //add email to the list of emails to be verified
        //insert a unique verificationToken into table
        const verificationToken = await createVerificationToken();
        await queryDatabase('INSERT INTO email_verification (token, email, password) VALUES (?, ?, ?)', [verificationToken, req.body.email, req.body.password]);
        await sendVerificationEmail(req.body.email, verificationToken);

        res.json({success:true});
    }
    catch(err) {
        if(err.message === "Email in use") {
            res.json({success: "Email in use"});
        }
        else { 
            res.json({success:false});
        }
    }
});
     
async function accountVerification(email) { //returns true if account is good to sign up, otherwise false
    try {
        const results = await queryDatabase("SELECT * FROM users WHERE email = ?", [email]);
        
        //if results exists, means that an account with that email exists, so say not verified
        if(results) {  return false; }  
        else return true;
    }
    catch(err) {
        throw new Error(err.message);
    }
}
    
signInRouter.get("/login", function(req, res) {
    //only give the log in page if the user is authenticated
    if(req.isAuthenticated()) {
        res.redirect("/profile");
    }
    else {
        res.render("pages/logIn");
    }
});

signInRouter.post("/login/local", upload.none(), function(req, res, next) {

    passport.authenticate('local', function(err, user, info) {
        //after authentication, could be successful or not -- need to check
        if(err) {
            return res.render("pages/problemPage", { message: "Something went wrong" });
        }

        if(!user) { //if the user could not be found
            return res.json({error: info.message});
        }

        req.logIn(user, function(err) {
            if (err) {
                return res.render("pages/problemPage", { message: "Something went wrong on our side"});
            }
            
            // On successful login -- redirect to where they need to go
            if(req.query.returnTo) {
                res.redirect(req.query.returnTo); //previous page
            }
            else res.redirect("/");
        });

    })(req, res, next);
}); 

signInRouter.get("/login/google", (req, res, next) => {
    if(req.query.returnTo) {
        const returnTo = req.query.returnTo || '/';
        const state = JSON.stringify({ returnTo });
        passport.authenticate('google', { scope: ['email'], state })(req, res, next);
    }
   
    else passport.authenticate('google', { scope: ['email'] })(req, res, next);
});

signInRouter.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to your desired route
    //after authentication, could be successful or not -- need to check
    if(req.isAuthenticated()) { //if the user is authenticated, redirect them to
        const state = req.query.state ? JSON.parse(req.query.state) : {};
        const returnTo = state.returnTo || '/';
        res.redirect(returnTo); //previous page
    }
    else{
        res.render("pages/problemPage", { message: "Authentication failed" });
    } 
});
    

 
export default signInRouter; 
