const express = require("express");
const expressApp = express();

expressApp.use(express.json())

// v0 endpoint routers
expressApp.use("/v0/message", require("./routes/v0/message").messageRouter);
expressApp.use("/v0/query", require("./routes/v0/query").queryRouter);
expressApp.use("/v0/publish", require("./routes/v0/publish").publishRouter);
// expressApp.use("/v0/update", require("./routes/v0/update").updateRouter);


// listen
expressApp.listen(3000, ()=> {
    console.log("Running mizu server in localhost on port 3000.")
})