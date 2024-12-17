// **NOTES:
//reporting someone from transaction details is here too
// /accepter means route for accepter, /donor means route for donor

import express from "express";
var transactionDetailsRouter = express.Router();
import { queryDatabase } from "../serverside utils/database.js";
import { ifAuthenticated } from "../server.js";

transactionDetailsRouter.get("/accepter", ifAuthenticated, async (req, res, next) => { //gets product for accepter
    
    if(!req.query.p) { //if p (productID) doesn't exist
        next(new Error('Bad request'));
        return;
    }

    //if user doesn't own the product that they're searching for
    if(!req.user.accountInformation.acceptedFreebies.includes(req.query.p)) {
        next(new Error("Forbidden"));
        return;
    }
 
    try {
        //get the product
        const [product] = await queryDatabase("SELECT productID, productName, productImage, productDescription, donorID, interestInformation, reportInformation FROM products WHERE productID = ?", [req.query.p])
        
        if(!product) next(new Error("Bad request"));

        res.render("pages/accepterDetails", { product: product });
    }
    catch(err) {
        next(new Error('Server error'));
    }

    /*
    need to get:
    - product name
    - product image
    - product description
    - reception link
    - interest information:
        - if interest was sent
        - in future --> if was read or not
    - reported information
        - if report has been made
    */
});


transactionDetailsRouter.post("/accepter/unaccept", ifAuthenticated, async (req, res, next) => { //allows accepter to unaccept the item
    
    if(!req.body.p) { //if p doesn't exist
        next(new Error('Bad request'));
    }

    if(!req.user.accountInformation.acceptedFreebies.includes(req.query.p)) {
        next(new Error("Forbidden"));
        return;
    }

    try {
        //unaccept product and reset product data
        await queryDatabase("UPDATE products SET accepted = 0, interestInformation = ?, otherInformation = ? WHERE productID = ?", 
            [
                JSON.stringify({emailRead: false,}), 
                JSON.stringify({}), 
                req.body.p,
            ]
        );

        //unaccept product in accountInformation
        req.user.accountInformation.acceptedFreebies = req.user.accountInformation.acceptedFreebies.filter(productID => productID !== req.query.p);
        //update accountInformation in DB
        await queryDatabase("UPDATE users SET accountInformation = ? WHERE id = ?", [req.user.accountInformation, req.user.id]);

        //if the unaccepting was  succssful:
        res.json({success: true});
    }
    catch(err) {
        next(new Error("Server error"));
    }

});

transactionDetailsRouter.get("/donor", ifAuthenticated, async (req, res, next) => { //gets product for accepter
    
    if(!req.query.p) { //if p doesn't exist
        next(new Error('Bad request'));
        return;
    }

    if(!req.user.accountInformation.donatedFreebies.includes(req.query.p)) {
        next(new Error("Forbidden"));
        return;
    }
 
    try {
        //get the product
        const [product] = await queryDatabase("SELECT productID, productName, productImage, productDescription, donorID, interestInformation, reportInformation FROM products WHERE productID = ?", [req.query.p])
        if(!product) next(new Error("Bad request"));

        res.render("pages/donorDetails", { product: product });
    }
    catch(err) {
        next(new Error('Server error'));
    }

    /*
    need to get:
    - product name
    - product image
    - product description
    - reception link
    - interest information:
        - if interest was sent
        - in future --> if was read or not
    - reported information
        - if report has been made
    */
});

transactionDetailsRouter.post("/donor/cancelDonation", ifAuthenticated, async (req, res, next) => {
    
    if(!req.params.p) {
        next(new Error("Bad request"));
    }

    if(!req.user.accountInformation.donatedFreebies.includes(req.params.p)) {
        next(new Error("Forbidden"));
    }

    //if request is good -> we can cancel the donation
    try {
        //get the accepterID from the product so that we know which accepter is affected by this
        const [product] = await queryDatabase("SELECT accepterID FROM products WHERE productID = ?", [req.params.p]);
        
        //remove the donation from donors list
        req.user.accountInformation.donatedFreebies = req.user.accountInformation.donatedFreebies.filter(freebie => freebie !== req.params.p);
        await queryDatabase("UPDATE users SET accountInformation = ? WHERE id = ?", [req.user.accountInformation, req.user.id]);

        //remove the accepting from the accepters list
        let [accepterAccountInformation] = await queryDatabase("SELECT accountInformation FROM users WHERE id = ?", [product.accepterID]);
        accepterAccountInformation.donatedFreebies = accepterAccountInformation.donatedFreebies.filter(freebie => freebie !== req.params.p);
        await queryDatabase("UPDATE users SET accountInformation = ? WHERE id = ?", [accepterAccountInformation, product.accepterID]);
        
        //need to delete the donation
        await queryDatabase('DELETE FROM products WHERE productID = ?', [req.params.p]);
    }
    catch(err) {
        next(new Error("Server error"));
    }
});


export default transactionDetailsRouter; 
