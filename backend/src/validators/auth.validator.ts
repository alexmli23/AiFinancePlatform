import {z} from "zod";

export const emailSchema = z.string().trim().email("Invalid email format").min(1).max(255)
export const registerSchema = z.object({

})

export const loginSchema = z.object({})