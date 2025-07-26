import mongoose, { Document } from 'mongoose';

export enum ReportStatusEnum {
    SENT= "SENT",
    PENDING= "PENDING",
    FAILED= "FAILED"
}

export interface ReportDocument extends Document {
    userId: mongoose.Types.ObjectId
    period: string
    sentDate: Date
    status: keyof typeof ReportStatusEnum
    createdAt: Date
    updatedAt: Date
}