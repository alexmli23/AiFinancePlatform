import mongoose, { Document } from 'mongoose';

export enum ReportFrequencyEnum {
    MONTHLY = "MONTHLY",
}

export interface ReportDocument extends Document {
    userId: mongoose.Types.ObjectId
    frequency: keyof typeof ReportFrequencyEnum
    isEnabled: boolean
    nextReportDate?: Date
    lastSentDate?: Date
    createdAt: Date
    updatedAt: Date
}

const reportSchema = new mongoose.Schema<ReportDocument>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    frequency: {
        type: String,
        enum: Object.values(ReportFrequencyEnum),
        default: ReportFrequencyEnum.MONTHLY
    },
    isEnabled: {
        type: Boolean,
        default: true
    },
    nextReportDate: {
        type: Date,
        default: null
    },
    lastSentDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
})

const ReportModel = mongoose.model<ReportDocument>("Report", reportSchema)