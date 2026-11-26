const mongoose=require('mongoose');
const categories=['appetizer','main course','dessert','beverage','side dish'];
const mealSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,minlength:2,maxlength:100},restaurant:{type:mongoose.Schema.Types.ObjectId,ref:'Restaurant',required:true,index:true},
 description:{type:String,required:true,trim:true,minlength:5,maxlength:500},price:{type:Number,required:true,min:0},category:{type:String,enum:categories,required:true,lowercase:true,trim:true},
 ingredients:{type:[{type:String,trim:true}],required:true,validate:{validator:v=>v.length>0,message:'At least one ingredient is required'}},
 calories:{type:Number,min:0},isVegetarian:{type:Boolean,default:false},isVegan:{type:Boolean,default:false},isGlutenFree:{type:Boolean,default:false},isSpicy:{type:Boolean,default:false},
 preparationTime:{type:Number,required:true,min:0},isAvailable:{type:Boolean,default:true},image:{type:String,default:''}
},{timestamps:true});
mealSchema.index({category:1}); mealSchema.index({restaurant:1,category:1});
module.exports=mongoose.models.Meal||mongoose.model('Meal',mealSchema);
