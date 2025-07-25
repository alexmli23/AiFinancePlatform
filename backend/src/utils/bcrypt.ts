import bcyrpt from "bcrypt"

export const hashValue = async(value: string, saltRounds: number = 10) =>
    await bcyrpt.hash(value, saltRounds)

export const compareValue = async(value: string, hashedValued: string) =>
    await bcyrpt.compare(value, hashedValued)