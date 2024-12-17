import mysql from "mysql2";
import dotenv from "dotenv"; // for environemntal vars
import { serversideIssue } from "../server.js";
import crypto from "crypto";

dotenv.config();

export var pool;

//creating pool using environmental variables
try {
    pool =  mysql.createPool({
        host: process.env.MY_SQL_HOST,
        user: process.env.MY_SQL_USER,
        password: process.env.MY_SQL_PASSWORD,
        port: process.env.MY_SQL_PORT,
        database: process.env.MY_SQL_DATABASE,
    }).promise();
}
catch(err) {
    serversideIssue("COULDN'T CREATE POOL || " + err);
}


export default pool;


export async function addFreebeeAccount(email, password, phoneNumber) {

    const accountInformation = {
        phoneNumber: "",
        acceptedFreebies: [],
        donatedFreebies: [],
        reports: {
            reportsReceived: [],
            reportsIssued: [],
        },
        emailVerified: false,
    };


    let sql = "INSERT INTO users (email, password, accountInformation) VALUES (?, ?, ?)";
    await pool.query(sql, [email.toLowerCase(), password, JSON.stringify(accountInformation)]);
}

export async function createVerificationToken() { //creates 40 character verification token
    const token = crypto.randomBytes(20).toString('hex'); 
    try {
        const [results] = await queryDatabase("SELECT COUNT(*) AS count FROM email_verification WHERE token = ?", [token]);
        if(results.count > 0) {
            console.log("Verification token already existed");
            //recursive creation of verification token until new one is generated and returned all the way back to original call
            token = await createVerificationToken(); 
        }
        return token;
    }
    catch(err) { //if querying doesn't work
        console.log("err,", err);
        throw new Error("Creating verification token didn't work");
    }
}



export async function queryDatabase(sql, data, connection = null) { //update queries, selection queries, etc.
    let results; 
    if(connection == null) {
        results = await pool.query(sql, data);     
    }
    else {
        results = await connection.query(sql, data);  
    }
    return results[0]; //returns meaningless stuff if adding data, but meaningful stuff if retrieving
} 