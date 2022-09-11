import express from "express";
export const publishRouter = express.Router();
// let publishCommand = require("../../../publish").publishCommand

publishRouter.post("/", (req, res)=>{
    const message = req.body;
    console.log(message);

    // let publishCommandOptions ={
    //     input: "",
    //     storageType: "n3",
    //     databasePath: "",
    // }

    // publish message
    //publishCommand(publishCommandOptions);

    res.send({
        statusCode:200,
        data: {
            status:"Message Published"
        }
    })
})


// module.exports = {
//     publishRouter
// }