import { connect } from "mongoose";

export const conn = async() => {
    try {
        await connect(`mongodb://localhost:27017/Sephscribe`)
    } catch(err) {
        console.log(err);    
        throw new Error(err);
    }
}

// mongodb+srv://josephemanuelbataller:${process.env.MONGODB_PASSWORD}@sephnet.oe3yibi.mongodb.net/?retryWrites=true&w=majority&appName=SephNet