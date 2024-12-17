import express from "express";
var profileRouter = express.Router();
import { queryDatabase } from "../serverside utils/database.js";

profileRouter.get("/", (req, res) => {
    if(req.isAuthenticated()) {
        res.render("pages/profile.ejs", { email: req.user.email });
    }
    else res.redirect("/login?returnTo=/profile");  
});

profileRouter.get("/getProfile", async function(req, res) {
    //profile information to get: email, phone number

    //settings information to get: none
    var settings = [];

    //freebie information to get: all freebies
    var acceptedFreebies = []; //contains all freebies
    var donatedFreebies = [];


    for(let freebieID of req.user.accountInformation.acceptedFreebies) {
        try {
            var freebie = await queryDatabase("SELECT * FROM products WHERE productID = ?", [freebieID]);
        }
        catch(err) {
            res.render("pages/problemPage.ejs", { message: "Sorry, something went wrong on our end" });
        }
        acceptedFreebies.push(freebie);
    }

    for(let freebieID of req.user.accountInformation.donatedFreebies) {
        try {
            var freebie = await queryDatabase("SELECT * FROM products WHERE productID = ?", [freebieID]);
        }
        catch(err) {
            res.render("pages/problemPage.ejs", { message: "Sorry, something went wrong on our end" });
        }
        donatedFreebies.push(freebie);
    }


    res.json(
        {
            profile: {
                email: req.user.email,
                phoneNumber: req.user.accountInformation.phoneNumber,
            },
            settings: [],
            acceptedFreebies: acceptedFreebies,
            donatedFreebies: donatedFreebies,
        }
    );
});


export default profileRouter;