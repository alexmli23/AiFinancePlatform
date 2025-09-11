import { exit } from "process"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import TransactionModel, { TransactionTypeEnum } from "../models/transaction.model"
import { BadRequestException, NotFoundException } from "../utils/app-error"
import { calculateNextOccurrence } from "../utils/helper"
import { createTransactionSchema } from "../validators/transaction.validator"
import {CreateTransactionType, UpdateTransactionType} from "../validators/transaction.validator"
import axios from "axios"
import { genAI, genAIModel } from "../config/google-ai.config"
import { createPartFromBase64, createUserContent } from "@google/genai"
import { receiptPrompt } from "../utils/prompt"

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

export const deleteTransactionService = async (userId: string, transactionId: string) => {
    const deleted = await TransactionModel.findOne({
        _id: transactionId,
        userId
    })

    if(!deleted) throw new NotFoundException("Transaction not found")
    return
}

export const bulkDeleteTransactionService = async(userId: string, transactionIds: string[]) => {
    const result = await TransactionModel.deleteMany({
        _id: {$in: transactionIds},
        userId, 
    })

    if(result.deletedCount === 0) throw new NotFoundException("No transactions found")

    return {
        success: true,
        deletedCount: result.deletedCount
    }
}

export const bulkTransactionService = async (userId: string, transactions: CreateTransactionType[]):
Promise<{ insertedCount: number; success: boolean }> => {
    try{
        const bulkOps = transactions.map((tx) => ({
            insertOne: {
                document: {
                    ...tx,
                    userId,
                    isRecurring: false,
                    nextRecurringDate: null,
                    recurringInterval: null,
                    lastProcesses: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            }
        }))
        const result = await TransactionModel.bulkWrite(bulkOps, {
            ordered: true
        })

        return {
            insertedCount: result.insertedCount,
            success: true
        }
    }catch(err){
        throw err
    }
}

export const scanReceiptService = async(file: Express.Multer.File | undefined) =>{
    if (!file) throw new BadRequestException("No file uploaded")
    
    try{
        if (!file.path) throw new BadRequestException("Failed to upload file")
        
        console.log(file.path)
        const responseDate = await axios.get(file.path, {
            responseType: "arraybuffer"
        })
        const base64String = Buffer.from(responseDate.data).toString("base64")

        if(!base64String) throw new BadRequestException("Could not process file")
        
        const result = await genAI.models.generateContent({
            model: genAIModel,
            contents: [
                createUserContent([
                    receiptPrompt,
                    createPartFromBase64(base64String, file.mimetype),
                ])
            ],
            config:{ temperature: 0, topP: 1, responseMimeType: "application/json"}
        })
        const response = result.text
        const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();

        if (!cleanedText) return {error: "Could not read reciept content"}

        const data = JSON.parse(cleanedText)
        if (!data.amount || !data.date){
            return {error: "Reciept missing required information"}
        }
        return {
            title: data.title || "Receipt",
            amount: data.amount,
            date: data.date,
            description: data.description,
            category: data.category,
            paymentMethod: data.paymentMethod,
            type: data.type,
            receiptUrl: file.path
        }
    }catch (error){
        return {error: "Reciept scanning service unavaliable"}
    }
}