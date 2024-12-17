import express from "express";
export const emailVerificationRouter = express.Router();
import { queryDatabase, addFreebeeAccount, pool } from "../serverside utils/database.js";
import passport from "passport";

emailVerificationRouter.get("/ve!:verificationToken", async function(req, res, next) { //when verification url is entered

    try {
            const connection = await pool.getConnection();
            
            //start transactions
            await connection.beginTransaction(); 

            //gets user based on verificationToken
            const [account] = await queryDatabase("SELECT email, password FROM email_verification WHERE token = ?", [req.params.verificationToken], connection);
            console.log(account);
            if(!account) throw new Error("Account doesn't exist in verification table");

            //puts new user in database
            await addFreebeeAccount(account.email, account.password, "");

            //deletes verification id information
            await queryDatabase('DELETE FROM email_verification WHERE token = ?', [req.params.verificationToken], connection);

            // commit the connection if all the queries go well
            await connection.commit(); 

            req.body.email = account.email; req.body.password = account.password; //passsport uses req.body by default for auth, so we have to define it here

            //if this all is successfull: authenticate and sign in through passport
            passport.authenticate('local', function(err, user, info) {
                //after authentication, could be successful or not -- need to check
                if(err) {
                    console.log(err);
                    return res.render("pages/problemPage", { message: "Something went wrong" });
                }
        
                if(!user) { //if the user could not be found
                    console.log(!user);
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
    }
    catch(err) { //if anything goes wrong
        connection.rollback(); //undo all changes that were made to DB

        res.render("pages/problemPage", {message: "Something went wrong on our side"});
        console.log(err);
    } 
    finally {
        connection.release(); 
    }
});

//** NOT NECESSARY, MAKE SOMETHING THAT DELETES OLD VERIFICATION IDS AFTER SOME TIME */
//autodeletes verified emails every 24 hours
export async function autodeleteVerificationIDs() {

    setInterval(async function() {
        
        await queryDatabase("DELETE FROM email_verification WHERE verified = 1");
        console.log(`Serverside -- deleted verification IDs`);

    }, 1440000) //runs every 24 hours
}