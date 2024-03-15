import express from "express"
import cookieParser from "cookie-parser"
import cors from 'cors'

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))


app.use(express.json({limit : "16kb"}));
app.use(express.urlencoded({ extended : true , limit : "20kb"}))
app.use(express.static("public"))

app.use(cookieParser())

// routes import 
import userRouter from './routes/user.router.js'
import profileRouter from "./routes/profile.router.js"
import reportRouter from "./routes/report.router.js"


// routes declaration 
app.use("/user" , userRouter)

app.use("/profile", profileRouter)

app.use("/report", reportRouter)



export { app }


