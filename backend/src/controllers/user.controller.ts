import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import {Request, Response} from "express"
import { findIdUserService } from "../services/user.service"
import { HTTPSTATUS } from "../config/http.config"

export const getCurrentUserController = asyncHandler(async (req: Request, res:Response) => {
    const userId = req.user?.id

    const user = await findIdUserService(userId)
    return res.status(HTTPSTATUS.OK).json({
        message: "User fetched successfully",
        user
    })
})