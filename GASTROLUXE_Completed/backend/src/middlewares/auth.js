const jwt=require('jsonwebtoken'); const User=require('../models/User');
async function protect(req,res,next){try{const h=req.headers.authorization||'';if(!h.startsWith('Bearer '))return res.status(401).json({success:false,message:'Authentication required'});const payload=jwt.verify(h.slice(7),process.env.JWT_SECRET);const user=await User.findById(payload.id);if(!user)return res.status(401).json({success:false,message:'User no longer exists'});req.user=user;next();}catch(e){res.status(401).json({success:false,message:'Invalid or expired token'});}}
const authorize=(...roles)=>(req,res,next)=>{if(!req.user||!roles.includes(req.user.role))return res.status(403).json({success:false,message:'You do not have permission for this action'});next();};
module.exports={protect,authorize};
