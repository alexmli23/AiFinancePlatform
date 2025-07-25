import "dotenv/config"
import express, {NextFunction, Request, Response} from "express"
import cors from "cors"
import { Env } from "./config/env.config"
import { HTTPSTATUS } from "./config/http.config"
import { errorHandler } from "./middlewares/errorHandler.middleware"
import { asyncHandler } from "./middlewares/asyncHandler.middleware"
import connectDatabase from "./config/database.config"

const app = express()
const BASE_PATH = Env.BASE_PATH

app.use(express.json())
app.use(express.urlencoded({extended: true}))

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

app.use(errorHandler)

app.listen(Env.PORT, async () => {
    await connectDatabase()
    console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`)
})