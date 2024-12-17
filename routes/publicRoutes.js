import express from 'express';
export var publicRoutes = express.Router();

//importing router for searching
import searchRouter from "./searchRouter.js";
publicRoutes.use("/search", searchRouter);

//importing routing for email verification -- figure out where this goes!!
import { emailVerificationRouter, autodeleteVerificationIDs } from "./emailVerificationRouter.js";
publicRoutes.use("/emailVerification", emailVerificationRouter);
autodeleteVerificationIDs();