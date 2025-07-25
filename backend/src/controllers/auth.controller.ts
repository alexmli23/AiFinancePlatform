import { HTTPSTATUS } from "../config/http.config"
import {asyncHandler} from "../middlewares/asyncHandler.middleware"
import { Request, Response } from "express"
import { registerSchema } from "../validators/auth.validator"

export const RegisterController = asyncHandler(async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body)
    return res.status(HTTPSTATUS.CREATED).json({message: "User registered successfully"})
})
