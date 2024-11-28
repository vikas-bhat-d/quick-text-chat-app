import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"
import asyncHandler from "../utils/asyncHandler.utils.js"
import apiError from "../utils/apiError.utils.js"

const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const accessToken=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!accessToken)
            throw new apiError(401,"Unauthorized request",["accesToken not found"])
    
        let decodedToken=jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
        
        if(!decodedToken)
            throw new apiError(400,"Invalid token");
        
        
        const user=await User.findById(decodedToken._id).select("-password -refreshToken");
        if(!user)
            throw new apiError(400,"Invalid token,User not found")
    
        req.user=user;

    } catch (error) {
        throw new apiError(400,error.message||"verifying token failed");
    }
})

const verifyUser=asyncHandler(async (req,res,next)=> {
    const phoneNumber=req.headers.phonenumber;
    try {
        const user=await User.findOne({phoneNumber:phoneNumber}).select("-password -refreshToken");
        if(!user)
            throw new apiError(400,"Invalid token,User not found")
    
        req.user=user;
    } catch (error) {
        throw new apiError(400,error.message||"user not found");
    }

})

export {verifyJWT,verifyUser}