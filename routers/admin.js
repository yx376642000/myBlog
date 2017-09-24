var express = require('express');
var router = express.Router();
var User = require("../models/User");
var Category = require("../models/Category");
var Article = require("../models/Article");
var Myself = require("../models/Myself");
var Link = require("../models/Link");

router.use(function (req,res,next) {
   if(!req.userInfo.isAdmin){
       //如果当前用户为非管理员
       res.send("对不起，只有管理员才能够进入后台管理页面！");
       return;
   }
   next();
});
/*
* 首页
* */
router.get("/",function (req,res,next) {
    res.render('admin/index',{
        userInfo:req.userInfo
    });
});

/*
* 用户管理
* */

router.get("/user",function (req,res) {
    /*
    * 从数据库中获取所有的用户数据
    * limit() 限制获取的数据条数
    * skip()  忽略数据的条数
    * */
    var page = Number(req.query.page || 1);
    var limit = 8;
    var pages = 0;
    User.count().then(function (count) {
        //计算总页数
        pages = Math.ceil(count/limit);

        //取值不能大于pages
        if (page >= pages) {
            page = Math.min(page,pages);
        }

        //取值不能小于1
        if (page <= 1) {
            page = Math.max(page,1);
        }

        var skip = (page - 1)*limit;

        User.find().limit(limit).skip(skip).sort({_id:-1}).then(function (users) {
            res.render('admin/user_index',{
                userInfo:req.userInfo,
                users:users,
                page:page
            });
        });
    });
});
/*
 * 分类管理
 * */
router.get("/category",function (req,res) {
    var page = Number(req.query.page || 1);
    var limit = 8;
    var pages = 0;
    Category.count().then(function (count) {
        //计算总页数
        pages = Math.ceil(count/limit);

        //取值不能大于pages
        if (page >= pages) {
            page = Math.min(page,pages);
        }

        //取值不能小于1
        if (page <= 1) {
            page = Math.max(page,1);
        }

        var skip = (page - 1)*limit;

        Category.find().limit(limit).skip(skip).sort({_id:-1}).then(function (categories) {
            res.render('admin/category_index',{
                userInfo:req.userInfo,
                categories:categories,
                page:page
            });
        });
    });

});
/*
* 分类修改
* */
router.get('/category/edit',function (req,res) {
    //获取要修改的分类信息，并且用表单的形式展示出来
    var id = req.query.id || '';
    Category.findOne({
        _id:id
    }).then(function (category) {
        if(!category){
            res.render("admin/error",{
                userInfo:req.userInfo,
                message:"分类信息不存在"
            });
        }else{
            res.render("admin/category_edit",{
                userInfo:req.userInfo,
                category:category
            })
        }
    })

});
/*
* 保存修改信息
* */
router.post('/category/edit',function (req,res) {
    //获取要修改的分类信息，并且用表单的形式展示出来
    var id = req.query.id || '';
    var name = req.body.name || '';
    var englishName = req.body.englishName || '';
    var index = req.body.index || '';
    var description = req.body.description || '';
    Category.findOne({
        _id:id
    }).then(function (category) {
        if(!category){
            res.render("admin/error",{
                userInfo:req.userInfo,
                message:"分类信息不存在"
            });
            return Promise.reject();
        }else{
            //如果用户没有修改
            if(name == category.name && englishName == category.englishName && index == category.index && description == category.description){
                res.render('admin/success',{
                    userInfo:req.userInfo,
                    message:"修改成功",
                    url:"/admin/category"
                });
                return Promise.reject();
            }else{
                //要修改的名称是否在数据库中已存在
                return Category.findOne({
                    _id:{$ne:id},
                    name:name,
                });
            }
        }
    }).then(function (sameCategory) {
        if(sameCategory){
            res.render("admin/error",{
                userInfo:req.userInfo,
                message:"数据库中已存在同名分类"
            });
            return Promise.reject();
        }else{
            return Category.update({
                _id:id
            },{
                name:name,
                englishName:englishName,
                index:index,
                description:description
            });
        }
    }).then(function () {
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:"修改成功",
            url:"/admin/category"
        });
    })
});
/*
* 分类删除
* */
router.get("/category/del",function (req,res) {
   var id = req.query.id || '';
   Category.remove({
       _id:id
   }).then(function () {
       res.render("admin/success",{
           userInfo:req.userInfo,
           message:"删除成功",
           url:"/admin/category"
       });
   })
});
/*
* 分类添加
* */
router.get("/category/add",function (req,res) {
    res.render("admin/category_add",{
        userInfo:req.userInfo
    });
});
router.post("/category/add",function (req,res) {
    var name = req.body.name || '';
    var englishName = req.body.englishName || '';
    var index = req.body.index || '';
    var description = req.body.description || '';
    if(name == '' || englishName == '' || index ==''){
        res.render("admin/error",{
            userInfo:req.userInfo,
            message:"名称或英文名或地址不能为空"
        });
        return Promise.reject();
    }
    //数据库中是否已经存在同名分类
    Category.findOne({
        name:name
    }).then(function (result) {
        if(result){
            res.render("admin/error",{
                userInfo:req.userInfo,
                message:"分类已经存在"
            });
            return Promise.reject();
        } else{
            //保存
            return new Category({
                name:name,
                englishName:englishName,
                index:index,
                description:description
            }).save();
        }
    }).then(function (newCategory) {
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:"分类保存成功",
            url:"/admin/category"
        })
    })
});


/*
* 文章添加
* */
router.get("/article/add",function (req,res,next) {
    //读取所有的分类信息
    Category.find().sort({_id:1}).then(function (categories) {
        res.render('admin/article_add',{
            userInfo:req.userInfo,
            categories:categories
        });
    });
});
/*
* 文章存储
* */
router.post("/article/add",function (req,res,next) {
   var title = req.body.title;
   var description = req.body.description;
   var content = req.body.content;
   var user = req.userInfo._id.toString();
   //验证
    if(req.body.title == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:"文章标题不能为空"
        });
        return;
    }
    //保存到数据库
    return new Article({
        category:req.body.category,
        title:title,
        description:description,
        content:content,
        user:user
    }).save().then(function () {
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"内容保存成功",
            url:"/admin/article"
        })
    });
});
/*
* 文章展示
* */
router.get("/article",function (req,res,next) {
    var page = Number(req.query.page || 1);
    var limit = 8;
    var pages = 0;
    Article.count().then(function (count) {
        //计算总页数
        pages = Math.ceil(count/limit);
        //取值不能大于pages
        if (page >= pages) {
            page = Math.min(page,pages);
        }
        //取值不能小于1
        if (page <= 1) {
            page = Math.max(page,1);
        }
        var skip = (page - 1)*limit;
        Article.find().limit(limit).skip(skip).populate(["category","user"]).sort({_id:-1}).then(function (articles) {
            res.render('admin/article_index',{
                userInfo:req.userInfo,
                articles:articles,
                page:page
            });
        });
    });
});
/*
* 编辑文章
* */
router.get("/article/edit",function (req,res,next) {
    var id = req.query.id || '';
    var categories = [];
    Category.find().sort({_id:-1}).then(function (result) {
        categories=result;
        return Article.findOne({
            _id:id
        }).populate("category");
    }).then(function (article) {
        if(!article){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:"内容不存在"
            });
            return Promise.reject();
        }else{
            res.render("admin/article_edit",{
                userInfo:req.userInfo,
                article:article,
                categories:categories
            })
        }
    });
});
/*
* 编辑后保存
* */
router.post("/article/edit",function (req,res,next) {
    var id = req.query.id || '';
    var category = req.body.category;
    var title = req.body.title;
    var description = req.body.description;
    var content = req.body.content;
    if(category == ''){
        res.render("admin/error",{
            userInfo:req.userInfo,
            message:"分类不能为空"
        });
        return;
    }
    if(title == ''){
        res.render("admin/error",{
            userInfo:req.userInfo,
            message:"标题不能为空"
        });
        return;
    }
    Article.update({
        _id:id
    },{
        category:category,
        title:title,
        description:description,
        content:content
    }).then(function () {
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"内容保存成功",
            url:"/admin/article"
        })
    })
});

/*
* 文章删除
* */
router.get("/article/del",function (req,res) {
   var id = req.query.id || '';
   Article.remove({
       _id:id
   }).then(function () {
       res.render("admin/success",{
           userInfo:req.userInfo,
           message:"文章删除成功",
           url:"/admin/article"
       })
   })
});
router.get('/myself/add',function (req,res) {
   res.render("admin/myself_add",{
       userInfo:req.userInfo
   })
});
router.post("/myself/add",function (req,res,next) {
   var webName=req.body.webName;
   var name=req.body.myName;
   var birth=req.body.birth;
   var address=req.body.address;
   var now=req.body.now;
   var job=req.body.job;
   var likeBook=req.body.likeBook;
   var likeMusic=req.body.likeMusic;
   var description=req.body.description;
   var blogAddress=req.body.blogAddress;
   var time=req.body.time;
   var beian=req.body.beian;
   return new Myself({
       webName:webName,
       name:name,
       birth:birth,
       address:address,
       now:now,
       job:job,
       likeBook:likeBook,
       likeMusic:likeMusic,
       description:description,
       blogAddress:blogAddress,
       time:time,
       beian:beian,
   }).save().then(function () {
       res.render('admin/success',{
           userInfo:req.userInfo,
           message:"保存成功",
           url:"/admin/myself"
       })
   })

});

router.get('/myself',function (req,res,next) {
    Myself.find().then(function (myself) {
        res.render("admin/myself",{
            userInfo:req.userInfo,
            myself:myself
        })
    })
});
router.get('/myself/edit',function (req,res,next) {
   var id = req.query.id || '';
   Myself.findOne({
       _id:id
   }).then(function (myself) {
       res.render('admin/myself_edit',{
           userInfo:req.userInfo,
           myself:myself
       })
   })
});
router.post("/myself/edit",function (req,res,next) {
   var id = req.query.id || '';
    var webName=req.body.webName;
    var name=req.body.myName;
    var birth=req.body.birth;
    var address=req.body.address;
    var now=req.body.now;
    var job=req.body.job;
    var likeBook=req.body.likeBook;
    var likeMusic=req.body.likeMusic;
    var description=req.body.description;
    var blogAddress=req.body.blogAddress;
    var time=req.body.time;
    var beian=req.body.beian;
    Myself.update({
        _id:id
    },{
        webName:webName,
        name:name,
        birth:birth,
        address:address,
        now:now,
        job:job,
        likeBook:likeBook,
        likeMusic:likeMusic,
        description:description,
        blogAddress:blogAddress,
        time:time,
        beian:beian,
    }).then(function () {
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:"修改成功",
            url:"/admin/myself"
        })
    })
});



router.get("/link/add",function (req,res,next) {
   res.render("admin/link_add",{
       userInfo:req.userInfo
   })
});
router.post('/link/add',function (req,res,next) {
   var name=req.body.name;
   var link = req.body.link;
   return new Link({
       name:name,
       link:link
   }).save().then(function () {
       res.render("admin/success",{
           userInfo:req.userInfo,
           message:"添加成功",
           url:"/admin/link"
       })
   })
});
router.get("/link",function (req,res,next) {
   Link.find().sort({_id:-1}).then(function (links) {
       res.render('admin/links',{
           userInfo:req.userInfo,
           links:links
       })
   })
});
router.get('/link/edit',function (req,res,next) {
    var id = req.query.id || '';

    Link.find({
        _id:id
    }).then(function (link) {
        if(!link){
            res.render("admin/error",{
                userInfo:req.userInfo,
                message:"链接不存在"
            })
        } else {
            res.render('admin/link_edit',{
                userInfo:req.userInfo,
                link:link[0]
            })
        }

    })
});
router.post('/link/edit',function (req,res,next) {
   var id=req.query.id || '';
   var name= req.body.name;
   var link=req.body.link;
   Link.update({
       _id:id
   },{
       name:name,
       link:link
   }).then(function () {
       res.render("admin/success",{
           userInfo:req.userInfo,
           message:"修改成功",
           url:"/admin/link"
       });
   })
});
router.get("/link/del",function (req,res,next) {
    var id=req.query.id || '';
    Link.remove({
        _id:id
    }).then(function () {
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"删除成功",
            url:"/admin/link"
        })
    })

});











module.exports = router;
