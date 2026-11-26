const router=require('express').Router();const c=require('../controllers/authController');const {protect}=require('../middlewares/auth');const validate=require('../middlewares/validate');const s=require('../validations/schemas');
router.post('/register',validate(s.userRegister),c.register);router.post('/login',validate(s.login),c.login);router.get('/me',protect,c.me);module.exports=router;
