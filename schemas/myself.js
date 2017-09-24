var mongoose = require("mongoose");

//分类的表结构
module.exports = new mongoose.Schema({
    //关联字段 -分类的id
    webName:{
       type:String,
        default:"idle | 希声"
    },
    name:{
       type:String,
        default:"袁信"
    },
    birth:{
       type:String,
        default:"1994-10-25"
    },
    address:{
      type:String,
        default:"江苏省-徐州市"
    },
    now:{
        type:String,
        default:"上海市-徐汇区"
    },
    job:{
        type:String,
        default:"web前端、网站制作"
    },
    likeBook:{
      type:String,
        default:""
    },
    likeMusic:{
        type:String,
        default:""
    },
    description:{
        type:String,
        default:""
    },
    blogAddress:{
        type:String,
        default:"www.xisheng.com"
    },
    time:{
        type:"String",
        default:"2017年9月24日"
    },
    beian:{
        type:String,
        default:''
    }
});