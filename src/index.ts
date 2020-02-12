import express, { Request, Response } from "express";

const app = express();

app.get("/crawling", (req : Request, res : Response) => {
    res.send("hello");
    
});

app.listen(8080, () => {
    console.log("server on");
});

