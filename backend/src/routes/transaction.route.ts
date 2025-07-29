import {Router} from "express"
import { bulkDeleteTransactionController, bulkTransactionController, createTransactionController, deleteTransactionController, duplicateTransactionController, getTransactionByIdController, updateTransactionController } from "../controllers/transaction.controller"
import { getAllTransactionsController } from "../controllers/transaction.controller"

const transactionRoutes = Router()

transactionRoutes.post("/create", createTransactionController)
transactionRoutes.get("/all", getAllTransactionsController)
transactionRoutes.get("/:id", getTransactionByIdController)
transactionRoutes.put("/duplicate/:id", duplicateTransactionController)
transactionRoutes.put("/update/:id", updateTransactionController)
transactionRoutes.post("/bulk-transaction", bulkTransactionController)
transactionRoutes.delete("/delete/:id", deleteTransactionController)
transactionRoutes.delete("/bulk-delete",bulkDeleteTransactionController)

export default transactionRoutes