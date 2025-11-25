const mongoose=require("mongoose");
const adminSchema=new mongoose.Schema({
    email:{
       type:String,
       unique:true,
    },
    role:{
      type:String,
      unique:true,
      required:true,
      default:"admin",
    },
    password: {
    type: String,
    required: true,
    minlength: 6,
  },
})
const model=mongoose.model("admin",adminSchema);
module.exports=model;