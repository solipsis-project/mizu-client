const express = require("express");
const queryRouter = express.Router();
let queryCommand = require("../../../query").queryCommand

queryRouter.post("/", (req,res)=>{

    const query = req.body
    console.log(query)
    res.send("query received. processing it.");

    let queryCommandOptions = {
        input: query,
        ipfsOptions: {},
        storageType: "n3",
        databasePath: "",
        // any other options if required //
    }

    // perform query
    // queryCommand(queryCommandOptions);
})

module.exports = {
    queryRouter
}