const express = require("express");
const app = express();

app.get("/api", (req, res) => {
    res.json({ group: ["rob", "gary", "kush", "danny"] });
});

app.listen(8000, () => {
    console.log("Server started on port 8000");
});