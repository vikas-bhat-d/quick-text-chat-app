import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        index:true
    },
    nickname:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        index:true
    },
    emain:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    profilePicture:{
        //will be storing cloudinary link
        type:String
    },
    refreshToken:{
        type:String
    }
},
{
    timestamps:true
})

userSchema.pre('save',async function (next) {
    if(!this.isModified("password")) return
    
    this.password=await bcrypt.hash(this.password,10)
    next();
})

userSchema.methods.checkPassword=async function (password) {
   const isCorrect=await bcrypt.compare(password,this.password)
   return isCorrect
}


userSchema.methods.generateAccessToken=async function() {

    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            phoneNumber:this.phoneNumber
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:'24h'
        }
    )
    
}



userSchema.methods.generateRefreshToken=async function () {
    return jwt.sign(
        {
            _id:this._id,
            phoneNumber:this.phoneNumber
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:'10d'
        }
    )
}

export const User=mongoose.model('User',userSchema);