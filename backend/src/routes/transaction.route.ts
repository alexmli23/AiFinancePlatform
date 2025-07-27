import {Router} from "express"
import { createTransactionController, duplicateTransactionController, getTransactionByIdController } from "../controllers/transaction.controller"
import { getAllTransactionsController } from "../controllers/transaction.controller"

const transactionRoutes = Router()

transactionRoutes.post("/create", createTransactionController)
transactionRoutes.get("/all", getAllTransactionsController)
transactionRoutes.get("/:id", getTransactionByIdController)
transactionRoutes.put("/duplicate/:id", duplicateTransactionController)

export default transactionRoutes