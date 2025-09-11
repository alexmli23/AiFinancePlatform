import "dotenv/config"
import "./config/passport.config"
import express, {NextFunction, Request, Response} from "express"
import cors from "cors"
import { Env } from "./config/env.config"
import { HTTPSTATUS } from "./config/http.config"
import { errorHandler } from "./middlewares/errorHandler.middleware"
import { asyncHandler } from "./middlewares/asyncHandler.middleware"
import connectDatabase from "./config/database.config"
import authRoutes from "./routes/auth.routes"
import passport from "passport"
import { passportAuthenticateJwt } from "./config/passport.config"
import userRoutes from "./routes/user.routes"
import transactionRoutes from "./routes/transaction.route"
import { initalizeCrons } from "./crons"

const app = express()
const BASE_PATH = Env.BASE_PATH

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(passport.initialize())

app.use(
    cors({
        origin: Env.FRONTEND_ORIGIN,
        credentials: true,
    })
)

app.get("/", asyncHandler(async (req:Request, res: Response, next:NextFunction) => {
        throw new Error("This is a test error")
        res.status(HTTPSTATUS.OK).json({
            message: "Hi this is a test"
        })
}))


app.use(`${BASE_PATH}/auth`, authRoutes)
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes)
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, transactionRoutes)

app.use(errorHandler)

app.listen(Env.PORT, async () => {
    await connectDatabase()

    if(Env.NODE_ENV == "development"){
        await initalizeCrons()
    }

    console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`)
})