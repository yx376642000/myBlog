var express = require('express');
var router = express.Router();
var Category = require("../models/Category");
var Article = require("../models/Article");
var User = require("../models/User");
var Myself = require("../models/Myself");
var Link = require("../models/Link");

/*
* 处理通用数据
* */
var data;
router.use(function (req,res,next) {
   data={
       userInfo:req.userInfo,
       categories:[],
       ranks:[],
       news:[],
       links:[]
   };
   Category.find().sort({_id:-1}).then(function (categories) {
       data.categories=categories;
   }).then(function () {
       Article.find().limit(5).sort({views:-1}).then(function (ranks) {
           data.ranks=ranks;
       });

   });
    Article.find().limit(5).sort({addTime:-1}).then(function (news) {
        data.news=news;
    });
    Myself.find().then(function (rs) {
        data.beian=rs[0].beian;
    });
    Link.find().sort({_id:-1}).then(function (links) {
       data.links=links;
    });
   next();
});

router.get("/",function (req,res,next) {

    data.articles=[];
    Article.find().limit(4).sort({_id:-1}).populate(["category","user"]).then(function (articles) {
            data.articles=articles;
            res.render("main/index",data);
    });
});

router.get("/about",function (req,res,next) {

    data.category=req.query.category || '';
    var where = {};
    if(data.category){
        where.category=data.category;
    };
    Category.findOne({_id:data.category}).then(function (category) {
        data.category=category;

    }).then(function () {
        Myself.find().then(function (myself) {
            data.myself=myself;
            res.render("main/about",data);
        })
    });


});
router.get("/knowledge",function (req,res,next) {
    data.count=0;
    data.page=Number(req.query.page || 1);
    data.limit=5;
    data.pages=0;
    data.articles=[];
    data.category=req.query.category || '';
    var where = {};
    if(data.category){
        where.category=data.category;
    }
    Category.findOne({_id:data.category}).then(function (category) {
        data.category=category;
    });
    Article.where(where).count().then(function (count) {
        data.count=count;
        console.log(data.count);
        data.pages = Math.ceil(data.count/data.limit);
        //取值不能大于pages
        if (data.page >= data.pages) {
            data.page = Math.min(data.page,data.pages);
        }
        //取值不能小于1
        if (data.page <= 1) {
            data.page = Math.max(data.page,1);
        }
        var skip = (data.page - 1)*data.limit;
        return Article.where(where).find().limit(data.limit).skip(skip).sort({_id:-1}).populate(["category","user"]);

    }).then(function (articles) {
        data.articles=articles;
        res.render("main/knowledge",data);
        console.log(data);
    });
});
router.get("/moodlist",function (req,res,next) {
    data.count=0;
    data.page=Number(req.query.page || 1);
    data.limit=5;
    data.pages=0;
    data.articles=[];
    data.category=req.query.category || '';
    var where = {};
    if(data.category){
        where.category=data.category;
    }
    Category.findOne({_id:data.category}).then(function (category) {
        data.category=category;
    });
    Article.where(where).count().then(function (count) {
        data.count=count;
        data.pages = Math.ceil(data.count/data.limit);
        //取值不能大于pages
        if (data.page >= data.pages) {
            data.page = Math.min(data.page,data.pages);
        }
        //取值不能小于1
        if (data.page <= 1) {
            data.page = Math.max(data.page,1);
        }
        var skip = (data.page - 1)*data.limit;
        return Article.where(where).find().limit(data.limit).skip(skip).sort({_id:-1}).populate(["category","user"]);

    }).then(function (articles) {
        data.articles=articles;
        res.render("main/moodlist",data);
    });

});
router.get("/newlist",function (req,res,next) {
    data.count=0;
    data.page=Number(req.query.page || 1);
    data.limit=5;
    data.pages=0;
    data.articles=[];
    data.category=req.query.category || '';
    var where = {};
    if(data.category){
        where.category=data.category;
    }
    Category.findOne({_id:data.category}).then(function (category) {
        data.category=category;
    });
    Article.where(where).count().then(function (count) {
        data.count=count;
        data.pages = Math.ceil(data.count/data.limit);
        //取值不能大于pages
        if (data.page >= data.pages) {
            data.page = Math.min(data.page,data.pages);
        }
        //取值不能小于1
        if (data.page <= 1) {
            data.page = Math.max(data.page,1);
        }
        var skip = (data.page - 1)*data.limit;
        return Article.where(where).find().limit(data.limit).skip(skip).sort({_id:-1}).populate(["category","user"]);

    }).then(function (articles) {
        data.articles=articles;
        res.render("main/newlist",data);
    });

});

router.get("/new",function (req,res,next) {
   var id = req.query.id;
    data.count=0;
    data.page=Number(req.query.page || 1);
    data.limit=5;
    data.pages=0;
   Article.findOne({
       _id:id
   }).populate(["category","user"]).then(function (article) {
       data.article=article;
       article.views++;
       article.save();
       res.render('main/new',data);
   });
});


module.exports = router;