import express,{Router} from "express"
import cookieParser from "cookie-parser"
import cors from "cors"



const app=express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json());
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send("listening");
})

import { userRouter } from "../routes/user.route.js"
app.use("/api/v1/user",userRouter);

app.get('/hello',(req,res)=>{
    const user=req.query.user;
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <p>Hello ${user} this is the test file</p>
</body>
</html>`);
})



export default app;