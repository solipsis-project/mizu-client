const express = require("express");
const messageRouter = express.Router();
let viewMessage = require("../../../view").viewCommand

messageRouter.get("/:cid/:path", (req, res) => {

    console.log({
        cid: req.params.cid,
        path: req.params.path
    })

    res.json({
        cid: req.params.cid,
        path: req.params.path,
        queryParameters: req.query
    })

    let viewMessageOptions = {
        path: req.params.path,
        storageType: "n3",
        databasePath: "",
        // any other options if required //
    }
    // the viewCommand in "../../../view" is not using cid and other parameters curently
    // so just commenting for now
    // viewMessage(viewMessageOptions);
})



module.exports = {
    messageRouter
}