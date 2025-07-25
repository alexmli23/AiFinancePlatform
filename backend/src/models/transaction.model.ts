import mongoose, {Schema} from "mongoose";
import { convertToCents, convertToDollarUnit } from "../utils/formate-currency";
import { boolean } from "zod";
import { Setter } from "date-fns/parse/_lib/Setter";

export enum TransactionTypeEnum{
    INCOME ="INCOME",
    EXPENSE = "EXPENSE"
}

export enum TransactionStatusEnum{
    PENDING="PENDING",
    COMPLETED="COMPLETED",
    FAILED="FAILED"
}

export enum RecurringIntervalEnum{
    DAILY ="DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY"
}

export enum PaymentMethodEnum{
    CARD = "CARD",
    BANK_TRANSFER = "BANK_TRANSFER",
    MOBILE_PAYMENT = "MOBILE_PAYMENT",
    AUTO_DEBIT = "AUTO_DEBIT",
    CASH = "CASH",
    OTHER = "OTHER"
}

export interface TransactionDocument extends Document{
    userId: mongoose.Types.ObjectId
    type: keyof typeof TransactionTypeEnum 
    title: string
    amount: number
    category: string,
    receiptUrl?: string
    recurringInterval?: keyof typeof RecurringIntervalEnum
    nextRecurringDate?: Date
    lastProcessed: Date
    isRecurring: boolean
    description?: string
    date: Date
    status: keyof typeof TransactionStatusEnum
    paymentMethod: keyof typeof PaymentMethodEnum
}

const transactionSchema = new mongoose.Schema<TransactionDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    title: {
        title: String,
        required: true,

    },
    type: {
        type: String,
        enum: Object.values(TransactionTypeEnum),
        required: true
    },
    amount: {
        type: Number,
        required:true,
        set: (value:number) => convertToCents(value),
        get: (value:number) => convertToDollarUnit(value)
    },

    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    receiptUrl: {
        type:String,
    },
    date: {
        type:Date,
        default: Date.now
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringInterval: {
        type: String,
        enum: Object.values(RecurringIntervalEnum),
        default: null
    },
    nextRecurringDate: {
        type:Date
    },
    lastProcessed: {
        type:Date
    },
    status: {
        type: String,
        enum: Object.values(TransactionStatusEnum),
        default: TransactionStatusEnum.COMPLETED
    },
    paymentMethod: {
        type:String,
        enum: Object.values(PaymentMethodEnum),
        default: PaymentMethodEnum.CASH
    }
}, {
    timestamps: true,
    toJSON: {virtuals: true, getters: true},
    toObject: {virtuals: true, getters: true}
})

const TransactionModel = mongoose.model<TransactionDocument>(
    "Transaction",
    transactionSchema
)

export default TransactionModel