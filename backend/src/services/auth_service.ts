import UserModel from "../models/user.model"
import mongoose from "mongoose"
import { NotFoundException, UnauthorizedException } from "../utils/app-error"
import { LoginSchemaType, RegisterSchemaType } from "../validators/auth.validator"
import { ReportFrequencyEnum } from "../models/report-setting.model"
import { calculateNextReportDate } from "../utils/helper"
import ReportSettingModel from "../models/report-setting.model"
import { signJwtToken } from "../utils/jwt"

export const registerService = async (body: RegisterSchemaType) => {
    const {email} = body

    const session = await mongoose.startSession()

    try{
        await session.withTransaction(async () => {
            const existingUser = await UserModel.findOne({email}).session(session)
            if(existingUser){
                throw new UnauthorizedException("user already exists with this email")
            }
        
            const newUser = new UserModel({...body})
            await newUser.save({session})

            const reportSetting = new ReportSettingModel({
                userId: newUser._id,
                frequency: ReportFrequencyEnum.MONTHLY,
                isEnabled: true,
                lastSentDate: null,
                nextReportDate: calculateNextReportDate()
            })
            return {user:newUser.omitPassword}
        })
    }catch(err){
        throw err
    }finally {
        session.endSession()
    }

}

export const loginService = async (body:LoginSchemaType) => {
        const {email, password} = body
        const user = await UserModel.findOne({email})

        if(!user) throw new NotFoundException("Email or Password not found")

        const isPasswordValid = await user.comparePassword(password)
        if(!isPasswordValid) throw new UnauthorizedException("Email or Password invalid")

        const { token, expiresAt} = signJwtToken({userId: user.id})

        const reportSetting = await ReportSettingModel.findOne({userId: user.id}, {_id: 1, frequency: 1, isEnabled: 1}).lean()

        return {
            user: user.omitPassword(),
            accessToken: token,
            expiresAt,
            reportSetting,
        }
    }