import { ErrorRequestHandler } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { AppError } from "../utils/app-error";
import { ZodError, z } from "zod";
import { Response } from "express";

const formatZodError = (res: Response, err: ZodError) => {
    const errors = err?.issues?.map((err) => ({
        field: err.path.join("."),
        message: err.message,
    }))
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Validation Error",
        errors:errors,
        errorCode: "VALIDATION_ERROR",
    })
}

export const errorHandler:ErrorRequestHandler= (err, req, res, next): any => {
    console.log("Error occured on PATH", req.path)

    if (err instanceof ZodError){
        return formatZodError(res, err)
    }

    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            message: err.message,
            errorCode: err.errorCode, 
        })
    }

    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: err?.message || "Unkown error occured"
    })
}