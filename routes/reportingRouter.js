import express from "express";
var reportingRouter = express.Router();
import { queryDatabase } from "../serverside utils/database.js";
import { ifAuthenticated } from "../server.js";

import multer from "multer";
const upload = multer();

//need to build a handler for reports later

//when user posts a report
reportingRouter.post("/issueReport", upload.none(), ifAuthenticated, async (req, res, next) => {

    //if bad request
    if(!req.query.p || !req.body.reportReason) {
        next(new Error('Bad request')) //bad requeset
        return;
    }

    if(req.body.reportReason == 'value' && !req.body.otherDetails) {
        next(new Error('Bad request')) 
        return;
    }

    //if they haven't accepted or donated this product
    if(!req.user.accountInformation.acceptedFreebies.includes(req.query.p) && !req.user.accountInformation.donatedFreebies.includes(req.query.p)) {
        next(new Error('Forbidden')); //forbidden
        return;
    }
    

    // if request is good
    try {

        let recipientID;
        //need to check whether issuer is accepter or donor
        if(req.user.accountInformation.acceptedFreebies.includes(req.query.p)) { //issuer is accepter
            //report RECIPIENT is the donor
            [recipientID] = await queryDatabase("SELECT donorID from products WHERE productID = ?", [req.query.p]);
            recipientID = recipientID.donorID;
        }
        else { //issuer is donor
            //report RECIPIENT is the accepter
            [recipientID] = await queryDatabase("SELECT accepterID from products WHERE productID = ?", [req.query.p]);
            recipientID = recipientID.accepterID;
        }
        //now that we we have the recipient's ID, we can actually file the report...

        //but first have to make sure you haven't already reported this person
        const [timesReported] = await queryDatabase("SELECT COUNT(*) AS count FROM reports WHERE issuerID = ? AND recipientID = ?", [req.user.id, recipientID]);
        if(timesReported.count > 0) throw new Error("Already reported");    

        const report = {
            recipientID: recipientID,
            issuerID: req.user.id,
            report: JSON.stringify({
                reason: req.body.reportReason,
                otherDetails: req.body.otherDetails,
            }),
        };

        await queryDatabase("INSERT INTO reports SET ?", report);
        
        res.json({results: 'success'});
    }
    catch(err) {
        //send success anwyays if already reported
        if(err.message === 'Already reported') {
            res.json({results: 'success'});
        }

        console.log(err);
        next(new Error('Server error')); //server error
        return;
    }
});

//for easy access to change later
reportingRouter.get("/donor", ifAuthenticated, async (req, res, next) => { //allows accepter to report the donor

    if(!req.query.p) { //if p doesn't exist
        next(new Error('Bad request')) //bad request
        return;
    }
    
    //if this freebie isn't accepted by the user
    if(!req.user.accountInformation.acceptedFreebies.includes(req.query.p)) {
        next(new Error('Forbidden')); //forbidden
    }

    const donorReport = [
        {value: "safety", option: "Posed a safety concern"},
        {value: "flaked", option: "Didn't show up to a planned meeting"},
        {value: "other", option: "Other"},
    ]
    /*accepter can report for:
    - donor safety
    - donor not showing up
    - other
    */

    res.render("pages/reportPage", { report: donorReport, type: "Donor", productID: req.query.p });

});

reportingRouter.get("/accepter", ifAuthenticated, async (req, res, next) => { //allows donor to report accepter

    if(!req.query.p) { //if p doesn't exist
        next(new Error('Bad request')) //bad request
        return;
    }

    //user hasn't actually donated
    if(!req.user.accountInformation.donatedFreebies.includes(req.query.p)) {
        next(new Error('Forbidden')); //forbidden
    }

    /*donor can report for:
        - accepter not safe
        - accepter didn't click received link
        - accepter didn't show up for meeting
        - other
    */
    
    const accepterReport = [
        {value: "safety", option: "Posed a safety concern"},
        {value: "noConfirmation", option: "Didn't confirm that they received their donation"},
        {value: "flaked", option: "Didn't show up to a planned meeting"},
        {value: "other", option: "Other"},
    ]

    res.render("pages/reportPage", { report: accepterReport, type: "Accepter" });

});


export default reportingRouter;