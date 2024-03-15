import mongoose from "mongoose";

export const connectDB = async () =>{

    try{
         const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}`);
         console.log('MongoDB Connected !!');

    }catch(error){
         console.log("MongoDB Connection error : " ,error );
         process.exit(1);
    }
}

