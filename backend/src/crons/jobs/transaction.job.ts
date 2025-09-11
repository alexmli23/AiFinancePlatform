import TransactionModel from "../../models/transaction.model"
import { calculateNextOccurrence } from "../../utils/helper"

export const processRecurringTransaction = async () => {
    const now = new Date()

    try{
        const transactionCursor = TransactionModel.find({
            isRecurring: true,
            nextRecurringDate: {$lte: now}
        }).cursor()

        console.log("Starting recurring process")

        for await( const tx of transactionCursor){
            const nextDate = calculateNextOccurrence(
                tx.nextRecurringDate!,
                tx.recurringInterval!
            )
        }
    }catch(error){

    }
}