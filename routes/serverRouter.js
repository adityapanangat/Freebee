import express from "express";
var serverRouter = express.Router();

serverRouter.get("/", (req, res) => {
    res.render("pages/index.ejs");
});

serverRouter.get("/clientsideUtils/dictionary", (req, res) => {
    res.sendFile(__dirname + "/node_modules/word-list-json/words.json");
});

export default serverRouter;