import asyncHandler from "../utils/asyncHandler.utils.js";
import apiError from "../utils/apiError.utils.js";
import apiResponse from "../utils/apiResponse.utils.js";
import {User} from "../models/user.model.js"
import cloudinaryUpload from "../utils/cloudinary.utils.js";
import fs from "fs"
import mongoose from "mongoose";

const cookieOptions={
    httpOnly:true,
    secure:true
}


const generateTokens=async function (userId) {
    try {
        const user=await User.findById(userId);
        const accessToken=await user.generateAccessToken();
        
        const refreshToken=await user.generateRefreshToken();
        user.refreshToken=refreshToken;
        
        await user.save({validateBeforeSave:false})
    
        return {accessToken,refreshToken}

    } catch (error) {
        throw new apiError(400,error?.message||"tokens couldn't be generated");
    }
}

const registerUser = asyncHandler(async (req, res, next) => {


    // let cloudinary_response = null;
    // let savedUser;
    // const { username, phoneNumber, userType, password, village, post, taluk, district, state, pincode } = req.body;

    // if ([username, phoneNumber, userType, password, state, pincode].some((field) => field?.trim() === "")) {
    //     throw new apiError(400, "All fields are required");
    // }

    // let existedUser = await User.findOne({ phoneNumber });
    // if (existedUser) throw new apiError(400, "User Already Exists");

    // let verifyUser = await Verification.findOne({ phoneNumber });
    // if (verifyUser?.isVerified === false) throw new apiError(400, "Phone number isn't verified");

    // try {
    //     if (req.file) cloudinary_response = await cloudinaryUpload(req.file.path);
    // } catch (error) {
    //     throw new apiError(400, "Cloudinary Upload Error: ", error);
    // }

    // const newAddress = new Address({
    //     phoneNumber: phoneNumber,
    //     village: village,
    //     post: post,
    //     taluk: taluk,
    //     district: district,
    //     state: state,
    //     pincode: pincode
    // });

    // try {
    //     const savedAddress = await newAddress.save();

    //     const newUser = new User({
    //         username: username,
    //         phoneNumber: phoneNumber,
    //         userType: userType,
    //         password: password,
    //         address: savedAddress._id,
    //         profilePicture: cloudinary_response?.secure_url || null,
    //     });

    //     try {
    //         savedUser = await newUser.save();
    //         console.log(savedUser);
    //     } catch (error) {
    //         throw new apiError(400, "User could not be saved", error);
    //     }

    // } catch (err) {
    //     console.error("Error details:", err);
    //     throw new apiError(400, "Address could not be saved", err);
    // }

    // if (req.file) fs.unlinkSync(req?.file?.path);

    // let registeredUser = await User.findOne({ _id: savedUser._id }).select("-password -createdAt -updatedAt");

    // console.log(registeredUser);

    // res.send(new apiResponse(200, registeredUser));

    const {username,email,password}=req.body;
    const displayPicture=req?.file?req.file.path:"";
    let cloudinaryResponse=null;
    let savedUser=null;

    if ([username, email,password,displayPicture].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required");
    }

    let existedUser = await User.findOne({$or:[{ username },{email}]});
    if (existedUser) throw new apiError(400, "User Already Exists");

    try {
        if(req.file){
            cloudinaryResponse = await cloudinaryUpload(displayPicture);
            // cloudinaryResponse = {secure_url:"test"}
            console.log(cloudinaryResponse);
        }
    } catch (error) {
        throw new apiError(400, "Cloudinary Upload Error: ", error);
    }

    const newUser=new User({
        username,
        password,
        email,
        profilePicture:cloudinaryResponse?.secure_url
    })

    
    try {
        savedUser=await newUser.save();
        console.log(savedUser);
    } catch (error) {
        console.log(error);
        throw new apiError(400,"Could not register user");
    }

    if(req.file) fs.unlinkSync(req?.file?.path);

    const registeredUser=await User.findOne({_id:savedUser._id}).select('-password -createdAt -updatedAt');
    console.log(registeredUser);

    res.status(200).send(new apiResponse(200,registeredUser))

});

const fetchuser=asyncHandler(async (req,res,next)=> {
    const user=req.query.username;
    let fetchedUser=await User.findOne({username:user});
    res.send(new apiResponse(200,fetchedUser,"fetched user succesfully"));
})

const fetchuserID=asyncHandler(async (req,res,next)=> {
    console.log(req.query.userId);
    const userID= new mongoose.Types.ObjectId(req.query.userId);
    let fetchedUser=await User.findOne({_id:userID});
    res.send(new apiResponse(200,fetchedUser,"fetched user succesfully"));
})

const loginUser=asyncHandler(async(req,res,next)=>{
    let {phoneNumber,password}=req.body;

    if(phoneNumber.trim()=="" || password.trim()=="")
        throw new apiError(400,"All fields are required")

    let existedUser=await User.findOne({phoneNumber:phoneNumber})
    if(!existedUser)
        throw new apiError(400,"User with this phoneNumber doesn't exist")

    let isPasswordCorrect=await existedUser.checkPassword(password)

    if(!isPasswordCorrect) 
        throw new apiError(400,"Incorrect password")

    let {accessToken,refreshToken}=await generateTokens(existedUser._id);

    let loggedInUser=await User.find({_id:existedUser._id}).select('-password -refreshToken');

    return res
    .status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(
        new apiResponse(200,
            {User:loggedInUser,accessToken,refreshToken},
            "logged user succesfully"
        )
    )
})

const logoutUser=asyncHandler(async(req,res,next)=>{
    await User.findOneAndUpdate(
        {_id:req.user._id},
        {
            $set:{
                refreshToken:undefined
            }
        }
    )
    

    return res
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .status(200)
    .json(new apiResponse(200,{}, "User logged out succesfully"))
})
 


export
{
    registerUser,
    loginUser,
    logoutUser,
    fetchuser,
    fetchuserID
}