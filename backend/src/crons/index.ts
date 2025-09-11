import { startJobs } from "./scheduler";

export const initalizeCrons = async () => {
    try{
        const jobs = startJobs()
        console.log(`${jobs.length} cron job running`)
        return jobs
    } catch(error){
        console.log("CRON INIT ERROR:", error)
        return []
    }
}