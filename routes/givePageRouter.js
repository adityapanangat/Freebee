import express from "express";
var givePageRouter = express.Router();

import { serversideIssue, __dirname, ifAuthenticated } from "../server.js";
import { queryDatabase } from "../serverside utils/database.js";




givePageRouter.use(bodyParser.json());

//if user requests to get @ /give, respond with give page
givePageRouter.get("/", ifAuthenticated, async function(req, res) {
    res.render("pages/give_page.ejs");
});

import multer from "multer"; //handles files
import bodyParser from "body-parser"; //parses json
import { promises as fs } from 'fs';

const upload = multer({ dest: 'tempUploads/' }); // creates multer object called upload  

//if user decides to post @ /give, post their item -- **need to do validation
givePageRouter.post("/", upload.single('productImage'), async (req, res, next) => {
    try {
        const data = await fs.readFile(req.file.path) 
    
        var productObject = { //create project object
            productName: req.body.productName,
            productDescription: req.body.productDescription,
            productKeyWord: req.body.productKeyWord,
            productImage: data,
            accepted:0,
            received: 0,
            donorID: req.user.id,
            interestInformation: JSON.stringify({
                emailRead: false,
            }),
            otherInformation: JSON.stringify({

            }),
        };
            
        const createdProduct = await queryDatabase("INSERT INTO products SET ?", productObject) //insert product into database, then: 

        //after creating product -> add it to your donated freebies
        req.user.accountInformation.donatedFreebies.push(createdProduct.insertId);
        await queryDatabase("UPDATE users SET accountInformation = ? WHERE id = ?", [JSON.stringify(req.user.accountInformation), req.user.id]);
        res.sendStatus(200);
    }
    catch(err) {   
        console.log(err); 
        next(new Error("Server error"));
    }

});





// FUNCTION NEEDED TO CHECK FILE TYPE AND SIZE IN ORDER TO PREVENT MALWARE



export default givePageRouter; 
