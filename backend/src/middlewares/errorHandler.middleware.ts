import { ErrorRequestHandler } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { AppError } from "../utils/app-error";

export const errorHandler:ErrorRequestHandler= (err, req, res, next): any => {
    console.log("Error occured on PATH", req.path)

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