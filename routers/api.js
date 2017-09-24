var express = require('express');
var router = express.Router();
var User = require("../models/User");

//统一返回格式
var responseData;
router.use(function (req,res,next) {
    responseData = {
        code:0,
        message:''
    };
    next();
});
/*
* 用户注册
*   注册逻辑
*
*   1.用户名不能为控
*   2.密码不能为空
*   3.两次输入密码必须一致
*
*   1.用户名是否已经被注册    数据库查询
* */
router.post("/user/register",function (req,res,next) {
    var username= req.body.username.toString(),
        password = req.body.password,
        repassword = req.body.repassword;

    //用户是否为空
    if(username ==''){
        responseData.code=1;
        responseData.message="用户名不能为空";
        res.json(responseData);
        return;
    }
    //密码是否为空
    if(password == ''){
        responseData.code=2;
        responseData.message="密码名不能为空";
        res.json(responseData);
        return;
    }
    //密码是否相同
    if(password != repassword){
        responseData.code=3;
        responseData.message="两次输入的密码不一致";
        res.json(responseData);
        return;
    }

    //用户名是否已经注册
    User.findOne({
        username:username
    }).then(function (userInfo) {
        if(userInfo){
            responseData.code=4;
            responseData.message="用户名已存在";
            res.json(responseData);
            return;
        }
        //保存用户注册的信息到数据库中
        var user = new User({
            username:username,
            password:password
        });
        return user.save();
    }).then(function (newUserInfo) {
        responseData.message="注册成功";
        res.json(responseData);
        return;
    });
});
router.post("/user/login",function (req,res,next) {
   var username = req.body.username,
       password = req.body.password;
   if(username == '' || password == ''){
       responseData.code=1;
       responseData.message="用户名或者密码不能为空";
       res.json(responseData);
       return;
   };
   //查询数据库中用户名和密码的记录是否存在，如果存在则登录成功
    User.findOne({
        username:username,
        password:password
    }).then(function (userInfo) {
        if(!userInfo){
            responseData.code=2;
            responseData.message="用户名或者密码错误";
            res.json(responseData);
            return;
        }
        //用户名和密码正确
        responseData.message="登陆成功";
        responseData.userInfo={
            _id:userInfo._id,
            username:userInfo.username,
        };
        req.cookies.set("userInfo",JSON.stringify({
            _id:userInfo._id,
            username:escape(userInfo.username)
        }));
        res.json(responseData);
        return;
    });

});
router.get('/user/logout',function (req,res) {
    req.cookies.set('userInfo',null);
    res.json(responseData);
});
/*
* 用户删除
* */
router.get("/admin/user/del",function (req,res,next) {
    var id = req.query.id ||'';
    User.remove({
        _id:id
    }).then(function () {
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"用户删除成功",
            url:'/admin/user'
        })
    })
});
/*
* 用户编辑
* */
router.get("/admin/user/edit",function (req,res,next) {
   var id = req.query.id || '';
   User.findOne({
       _id:id
   }).then(function (user) {
       if(!user){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:"用户信息不存在"
            });
       }else{
           res.render("admin/user_edit",{
               userInfo:req.userInfo,
               user:user
           });
       }
   })
});
/*
* 保存编辑后的用户信息
* */
router.post("/admin/user/edit",function (req,res) {
    var isAdmin = 'false';
    if(req.body.isAdmin == 'on'){
        isAdmin ="true"
    };
    var id = req.query.id;
    var username = req.body.username || '';
    var password = req.body.password || '';
    User.findOne({
        _id:id
    }).then(function (user) {
        if(!user){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:"用户信息不存在"
            });
            return Promise.reject();
        }else{
            if(username == user.username && password == user.password && isAdmin == user.isAdmin ){
                res.render("admin/success",{
                    userInfo:req.userInfo,
                    message:"修改成功",
                    url:"/admin/user"
                });
                return Promise.reject();
            }else{
                return User.findOne({
                    _id:{$ne:id},
                    username:username,
                })
            }
        }
    }).then(function (sameUser) {
        if(sameUser){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:"用户已存在"
            });
            return Promise.reject();
        }else{
            return User.update({
                _id:id
            },{
                username:username,
                password:password,
                isAdmin:isAdmin
            });
        }
    }).then(function () {
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:"修改成功",
            url:"/admin/user"
        });
    })
});
/*
* 添加用户
* */
router.get("/admin/user/add",function (req,res) {
   res.render("admin/user_add",{
       userInfo:req.userInfo
   });
});
router.post("/admin/user/add",function (req,res,next) {
    var username = req.body.username;
    var password = req.body.username;

    var isAdmin = 'false';
    if(req.body.isAdmin == 'on'){
        isAdmin ="true"
    };
    if(username==''|| password==''){
        res.render("admin/error",{
            userInfo:req.userInfo,
            message:"用户名、密码或昵称不能为空"
        });
        return Promise.reject();
    }
    User.findOne({
        username:username
    }).then(function (result) {
        if(result){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:"用户名已存在"
            });
            return Promise.reject();
        }else{
            return new User({
                username:username,
                password:password,
                isAdmin:isAdmin
            }).save();
        }
    }).then(function () {
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"添加成功",
            url:"/admin/user"
        })
    })
});
module.exports = router;