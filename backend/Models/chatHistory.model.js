const mongoose=require("mongoose");

const chatHistorySchema=new mongoose.Schema({
    connectionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ChatConnection",
        required:true
    },
    messages:[
        {
            senderId:{
                type:mongoose.Schema.Types.ObjectId,
                required:true
            },
            senderType:{
                type:String,
                enum:["doctor","patient","admin"],
                default:"doctor"
            },
            text:{
                type:String,
                default:""
            },
            meta:{
                type:Object,
                default:{}
            },
            createdAt:{
                type:Date,
                default:Date.now
            }
        }
    ]
},{timestamps:true});

module.exports=mongoose.model("ChatHistory",chatHistorySchema);