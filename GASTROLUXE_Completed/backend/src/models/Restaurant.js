const mongoose=require('mongoose');
const timeSchema=new mongoose.Schema({open:{type:String,match:/^([01]\d|2[0-3]):[0-5]\d$/},close:{type:String,match:/^([01]\d|2[0-3]):[0-5]\d$/}},{_id:false});
const restaurantSchema=new mongoose.Schema({
 name:{type:String,required:true,unique:true,trim:true,minlength:2,maxlength:100},
 owner:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 description:{type:String,required:true,trim:true,minlength:10,maxlength:500},
 cuisine:{type:[{type:String,trim:true}],required:true,validate:{validator:v=>v.length>0,message:'At least one cuisine is required'}},
 address:{street:{type:String,required:true,trim:true},city:{type:String,required:true,trim:true},state:{type:String,required:true,trim:true},zipCode:{type:String,required:true,trim:true},country:{type:String,required:true,trim:true}},
 contact:{phone:{type:String,required:true,trim:true},email:{type:String,required:true,lowercase:true,trim:true}},
 openingHours:{type:Map,of:timeSchema,default:undefined},rating:{type:Number,min:0,max:5,default:0},isActive:{type:Boolean,default:true},image:{type:String,default:''}
},{timestamps:true});
restaurantSchema.index({name:1},{unique:true});
module.exports=mongoose.models.Restaurant||mongoose.model('Restaurant',restaurantSchema);
