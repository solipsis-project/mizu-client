import express from "express";
export const queryRouter = express.Router();
// let queryCommand = require("../../../query").queryCommand

queryRouter.post("/", (req,res)=>{

    const query = req.body
    console.log(query)
    res.send("query received. processing it.");

    // let queryCommandOptions = {
    //     input: query,
    //     ipfsOptions: {},
    //     storageType: "n3",
    //     databasePath: "",
    //     // any other options if required //
    // }

    // perform query
    //const queryResult = queryCommand(queryCommandOptions);

    res.send({
        statusCode:200,
        data:{
            //queryResult:queryResult,
            status: "ok"
        },
    });
})

// module.exports = {
//     queryRouter
// }