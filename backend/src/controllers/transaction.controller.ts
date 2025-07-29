import {Request, Response} from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { HTTPSTATUS } from "../config/http.config"
import { bulkDeleteTransactionSchema, bulkTransactionSchema, createTransactionSchema, transactionIdSchema, updateTransactionSchema } from "../validators/transaction.validator"
import { bulkDeleteTransactionService, bulkTransactionService, createTransactionService, deleteTransactionService, duplicateTransactionService, getAllTransactionService, getTransactionByIdService, updateTransactionService } from "../services/transaction.service"
import { TransactionTypeEnum } from "../models/transaction.model"
import { NotFoundException } from "../utils/app-error"

export const createTransactionController = asyncHandler(async (req: Request, res: Response) => {
    const body = createTransactionSchema.parse(req.body)
    const userId = req.user?._id

    const transaction = await createTransactionService(body, userId as string)

    return res.status(HTTPSTATUS.CREATED).json({
        message:"Transaction created successfully",
        transaction
    })
})

export const getAllTransactionsController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id

    const filters = {
        keyword: req.query.keyword as string | undefined,
        type: req.query.type as keyof typeof TransactionTypeEnum | undefined,
        recurringStatus: req.query.recurringStatus as "RECURRING" | "NON_RECURRING" | undefined, 
    }

    const pagination = {
        pageSize: parseInt(req.query.pageSize as string) || 20,
        pageNumber: parseInt(req.query.pageNumber as string) || 20
    }
    const result = await getAllTransactionService(userId as string, filters, pagination)

    return res.status(HTTPSTATUS.OK).json({
        message: "Transaction fetched successfully",
        ...result
    })
})

export const getTransactionByIdController = asyncHandler(async (req, res: Response) => {
    const userId = req.user?._id
    const transactionId = transactionIdSchema.parse(req.params.id)

    const transaction = await getTransactionByIdService(userId as string, transactionId)
    if(!transaction){
        throw new NotFoundException("Transaction not found")
    }

    return res.status(HTTPSTATUS.OK).json({
        message: "Transaction fetched successfully",
    })
})

export const duplicateTransactionController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id
    const transactionId = transactionIdSchema.parse(req.params.id)

    const transaction = await duplicateTransactionService(userId as string, transactionId)

    return res.status(HTTPSTATUS.OK).json({
        message: "transaction duplicated successfully",
        data: transaction
    })
})

export const updateTransactionController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id
    const transactionId = transactionIdSchema.parse(req.params.id)
    const body = updateTransactionSchema.parse(req.body)

    const updatedTransaction = await updateTransactionService(userId as string, transactionId, body)

    return res.status(HTTPSTATUS.OK).json({
        message: "transaction updated successfully",
        data: updatedTransaction
    })
})

export const deleteTransactionController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id
    const transactionId = transactionIdSchema.parse(req.params.id)

    await deleteTransactionService(userId as string, transactionId)

    return res.status(HTTPSTATUS.OK).json({
        message: "transaction deleted successfully",
    })
})

export const bulkDeleteTransactionController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id
    const {transactionIds} = bulkDeleteTransactionSchema.parse(req.body)

    const result = await bulkDeleteTransactionService(userId as string, transactionIds)

    return res.status(HTTPSTATUS.OK).json({
        message: "Transaction deleted successfully",
        ...result
    })
})

export const bulkTransactionController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id
    const { transactions } = bulkTransactionSchema.parse(req.body)

    const result = await bulkTransactionService(userId as string, transactions)

    return res.status(HTTPSTATUS.OK).json({
        message: "Bulk Transaction inserted successfully",
        ...result
    })
})