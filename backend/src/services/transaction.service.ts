import { exit } from "process"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import TransactionModel, { TransactionTypeEnum } from "../models/transaction.model"
import { NotFoundException } from "../utils/app-error"
import { calculateNextOccurrence } from "../utils/helper"
import { createTransactionSchema } from "../validators/transaction.validator"
import {CreateTransactionType, UpdateTransactionType} from "../validators/transaction.validator"

export const createTransactionService = async (body: CreateTransactionType, userId: string) => {
    let nextRecurringDate: Date | undefined
    const currentDate = new Date()

    if(body.isRecurring && body.recurringInterval){
        const calculatedDate = calculateNextOccurrence(body.date, body.recurringInterval)

        nextRecurringDate = calculatedDate < currentDate ?
            calculateNextOccurrence(currentDate, body.recurringInterval) 
            : calculatedDate
    }

    const transaction = await TransactionModel.create({
        ...body,
        userId,
        category: body.category,
        amount: Number(body.amount),
        isRecurring: body.isRecurring || false,
        reccurringInterval: body.recurringInterval || null,
        nextRecurringDate,
        lastProcessed: null
    })
    return transaction
}
``
export const getAllTransactionService = async (userId: string, filters: {keyword?:string, 
    type?:keyof typeof TransactionTypeEnum
    recurringStatus?: "RECURRING" | "NON_RECURRING"}, pagination: { pageSize: number,  pageNumber: number }) => {
    const { keyword, type, recurringStatus } = filters
    const filterConditions: Record<string, any> = {
        userId, 
    }
    if (keyword){
        filterConditions.$or = [
            {title: {$regex: keyword, $options: "i"}},
            {category: {$regex: keyword, $options: "i"}},
        ]
    }
    if(type){
        filterConditions.type = type
    }

    if(recurringStatus){
        if(recurringStatus === "RECURRING"){
            filterConditions.isRecurring = true
        }else if (recurringStatus === "NON_RECURRING"){
            filterConditions.isRecurring = false
        }
    }
    const { pageSize, pageNumber } = pagination
    const skip = (pageNumber - 1) * pageSize

    const [transations, totalCount] = await Promise.all([
        TransactionModel.find(filterConditions)
            .skip(skip)
            .limit(pageSize)
            .sort({createdAt: -1}),
            TransactionModel.countDocuments(filterConditions)
    ])
    const totalPages = Math.ceil(totalCount / pageSize)
    return {
        transations,
        pagination: {
            pageSize,
            pageNumber,
            totalCount,
            totalPages,
            skip
        }
    }
}

export const getTransactionByIdService = async (userId: string, transactionId: string) => {
    const transaction = await TransactionModel.findOne({_id: transactionId, userId})
    if(!transaction) throw new NotFoundException("Transaction not found")
    return transaction
}

export const duplicateTransactionService = async (userId: string, transactionId: string) => {
    const transaction = await TransactionModel.findOne({_id: transactionId, userId})
    if(!transaction) throw new NotFoundException("Transaction not found")
    
    const duplicated = await TransactionModel.create({
        ...transaction.toObject(),
        id: undefined, 
        title: `Duplicate - ${transaction.title}`,
        description: transaction.description ? `${transaction.description} (Duplicate)` : "Duplicated transaction",
        isRecurring: false, 
        recurringInterval: undefined,
        nextRecurringDate: undefined,
        createdAt: undefined,
        updatedAt: undefined,
    })
    return duplicated
}

export const updateTransactionService = async(userId: string, transactionId: string, body: UpdateTransactionType) => {
    const exisitingTransaction = await TransactionModel.findOne({_id: transactionId, userId})
    if(!exisitingTransaction) throw new NotFoundException("Transaction not found")

    const now = new Date()
    const isRecurring = body.isRecurring ?? exisitingTransaction.isRecurring

    const date = body.date !== undefined ? new Date(body.date) : exisitingTransaction.date

    const recurringInterval = body.recurringInterval || exisitingTransaction.recurringInterval
    let nextRecurringDate: Date | undefined
    if(isRecurring && recurringInterval){
        const calculatedDate = calculateNextOccurrence(date, recurringInterval)
        nextRecurringDate = calculatedDate < now ? 
            calculateNextOccurrence(now, recurringInterval) : calculatedDate
    }

    exisitingTransaction.set({
        ...(body.title && {title: body.title}),
        ...(body.description && {description: body.description}),
        ...(body.type && {type: body.type}),
        ...(body.paymentMethod && {paymentMethod: body.paymentMethod}),
        ...(body.amount  !== undefined && {amount: Number(body.amount)}),
        date, 
        isRecurring,
        recurringInterval,
        nextRecurringDate,
    })

    await exisitingTransaction.save()
    return
}