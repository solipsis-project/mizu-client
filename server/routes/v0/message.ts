import express from "express";
export const messageRouter = express.Router();
// const exec = require("child_process").exec;
// let viewMessage = require("../../../view").viewCommand

messageRouter.get("/:cid/:path", (req, res) => {

    console.log({
        cid: req.params.cid,
        path: req.params.path,
        queryParameters: req.query
    })

    


    // the viewCommand in "../../../view" is not using cid and other parameters curently
    // so just commenting for now
    // viewMessage(viewMessageOptions);
    
    // or

    // exec("ls", (error, stdout, stderr)=>{
    //     if (error !== null){
    //         console.log("Error: ",error);
    //         process.abort();
    //     }
    //     console.log("stdout:\n"+stdout);

    // })

    res.json({
        statusCode: 200,
        data:{
            cid: req.params.cid,
            path: req.params.path,
            queryParameters: req.query,
            status: "ok"
        }   
    })

})



// module.exports = {
//     messageRouter
// }