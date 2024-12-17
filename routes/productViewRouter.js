import express from "express";
var productViewRouter = express.Router();
// /freebie

//if user wants to view a product in detail
productViewRouter.get("/", async function(req, res) {
    const query = 
    `
        SELECT *
        FROM products
        WHERE productID = ?
        LIMIT 1
    `;

    await queryDatabase(query, [req.query.p]).then(product => {
        res.render('pages/productView.ejs', { product: product[0] });
    });
});

import { queryDatabase } from "../serverside utils/database.js";
import { donationAcceptedEmail, contactAccepterEmail } from "../serverside utils/emailer.js";



//if a user wants to accept a freebie
productViewRouter.get("/accept", async function(req, res, next) {


    if(!req.isAuthenticated()) { //if they're not logged in, they can't accept a gift, have to log in. 
        
        res.redirect("/login?returnTo=/freebie?p=" + req.query.p);
        return;
    }

    try {

        if(req.user.accountInformation.acceptedFreebies.includes(req.query.p)) {
            throw new Error("User already owns freebie");
        }

        //checks to product exists and accepted = false
        const [product] = await queryDatabase("SELECT * FROM products WHERE productID = ? AND accepted = 0", [req.query.p]);
        
        const [donorEmailResults] = await queryDatabase("SELECT email FROM users WHERE id = ?", [product.donorID]);

        // if product was already accepted, throw error
        if(product == "") { throw new Error("Donation already accepted"); }

        //if not, accept it as fast as psosible
        await queryDatabase("UPDATE products SET accepted = 1 WHERE productID = ?", [req.query.p]);
        await queryDatabase("UPDATE products SET accepterID = ? WHERE productID = ?", [req.user.id, req.query.p]);

        //then, add product to acceptedFreebies:
        //add freebie to already existing accepted freebies

        req.user.accountInformation.acceptedFreebies.push(req.query.p);


        //push updated account informationt o db
        await queryDatabase("UPDATE users SET accountInformation = ? WHERE id = ?", [JSON.stringify(req.user.accountInformation), req.user.id]);
         
        //if all was successful, send emails to donor and accepter:
        await donationAcceptedEmail(req.query.p, product.productName, product.productImage, donorEmailResults.email, req.user.email);
        await contactAccepterEmail(req.query.p, product.productName, product.productImage, donorEmailResults.email, req.user.email);

        //show the user that everything worked
        res.render("pages/donationAccepted.ejs", { product: product });  
    }

    catch(err) {
        console.log(err);

        if(!err.message === "Donation already accepted") {
            res.render('pages/problemPage.ejs', {message: "Sorry, this donation has already been accepted."});
            return;
        }
        else if(err.message == "User already owns freebie") { //donation has already been accepted
            res.render('pages/problemPage.ejs', {message: "You have already accepted this donation! View it in your profile under 'Accepted freebies.'"});
            return;
        }
        else {
            next(new Error(err.message));
        }
    }
});

productViewRouter.get("/confirm/:productID", async function(req, res) {
    console.log("HI");
    //if not logged in, return
    if(!req.isAuthenticated()) {
        console.log("HI");
        res.redirect(`/login?returnTo=/freebie/confirm/${req.params.productID}`);
        return;
    }
    
    //if logged in, need to check if account is correct -- otherwise return
    if(!req.user.accountInformation.acceptedFreebies?.includes(req.params.productID)) {
        res.render("pages/problemPage", { message : "Forbidden" });
        return;
    }

    const getProductQuery =
    `
    SELECT *
    FROM products
    WHERE productID = ?
    `

    try {
        await queryDatabase(getProductQuery, req.params.productID).then(product => {
            res.render('pages/freebieConfirmation.ejs', { product: product[0]});
        });
    }
    catch(error) {
        res.render("pages/problemPage", {message: "Something went wrong" });
    }
    
});

//SHOULD FIX THIS TO A POST LATER!!
productViewRouter.post("/confirmed/:productID", async function(req, res) {
    
    try {
        //need to check to make sure that you actually are the accepter of this product

        const query = 
        `
        UPDATE products
        SET received = 1
        WHERE confirmationLink = ?
        `
        //need to add something where donor is rewarded 
        await queryDatabase(query, req.params.confirmationLink).then(product => {
            res.render('pages/donationConfirmed.ejs');
        });
    }
    catch(err) {

    }

});

export default productViewRouter; 
