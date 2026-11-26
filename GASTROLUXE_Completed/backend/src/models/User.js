const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,minlength:2,maxlength:50},
 email:{type:String,required:true,unique:true,lowercase:true,trim:true},
 password:{type:String,required:true,minlength:6,select:false},
 role:{type:String,enum:['admin','restaurant_owner','client'],default:'client',required:true},
 phone:{type:String,trim:true,default:''},address:{type:String,trim:true,default:''}
},{timestamps:true});
userSchema.index({email:1},{unique:true});
module.exports=mongoose.models.User||mongoose.model('User',userSchema);
