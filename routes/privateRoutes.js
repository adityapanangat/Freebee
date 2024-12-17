import express from "express";
export var privateRoutes = express.Router();

//importing routing for give page
import givePageRouter from "./givePageRouter.js";
privateRoutes.use("/give", givePageRouter);

//importing routing for sign in
import signInRouter from "./signInRouter.js";
privateRoutes.use(signInRouter);

//import router for basic server stuff (accessing dictionary, href='/')
import serverRouter from "./serverRouter.js";
privateRoutes.use(serverRouter);

//importing routing for viewing individual freebies
import productViewRouter from "./productViewRouter.js";
privateRoutes.use("/freebie", productViewRouter);

//importing routing for viewing profile
import profileRouter from "./profileRouter.js";
privateRoutes.use("/profile", profileRouter);

//importing routing for viewing transactionDetails
import transactionDetailsRouter from "./transactionDetailsRouter.js";
privateRoutes.use("/transactionDetails", transactionDetailsRouter);


import reportingRouter from "./reportingRouter.js";
privateRoutes.use("/report", reportingRouter);