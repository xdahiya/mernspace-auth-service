import express from "express";
const app = express();

app.get("/", (req, res) => {
    res.json({ msg: "done" });
});

export default app;
