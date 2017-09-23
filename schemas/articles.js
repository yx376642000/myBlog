var mongoose = require("mongoose");

//分类的表结构
module.exports = new mongoose.Schema({
    //关联字段 -分类的id
    category:{
        type:mongoose.Schema.Types.ObjectId,
        //引用
        ref:"Category"
   },
    user:{
        type:mongoose.Schema.Types.ObjectId,
       //引用
       ref:"User"
   },
    title:String,

    description:{
       type:String,
        default:""
    },
    content:{
        type:String,
        default:''
    },
    addTime:{
        type:Date,
        default:new Date()
    },
    views:{
        type:Number,
        default:0
    }


});