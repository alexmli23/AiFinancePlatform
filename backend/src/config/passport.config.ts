import {
    Strategy as JwtStrategy,
    ExtractJwt,
    StrategyOptions,
} from "passport-jwt"
import passport from "passport"
import { Env } from "../config/env.config"
import { findIdUserService } from "../services/user.service"

interface JwtPayload{
    userId: string
}

const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: Env.JWT_SECRET,
    audience: ["user"],
    algorithms: ["HS256"],
}

passport.use(
    new JwtStrategy(options, async (payload: JwtPayload, done) => {
        try{
            if(!payload.userId){
                return done(null, false, {message: "Invalid token payload"})
            }
            const user = await findIdUserService(payload.userId)
            if(!user) {
                return done(null, false)
            }
            return done(null, user)
        }catch(err){
            return done(err, false)
        }
    })
)

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user:any, done) => done(null, user))

export const passportAuthenticateJwt = passport.authenticate("jwt", { session: false })