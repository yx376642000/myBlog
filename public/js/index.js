$(function () {
    var $register = $("#register"),
        $login = $("#login"),
        $toReg = $("#toReg"),
        $toLogin = $("#toLogin");
    $toReg.find('a').on('click',function () {
       $login.hide();
       $register.show();
       $register.find(".message").html('');
    });
    $toLogin.find('a').on('click',function () {
        $register.hide();
        $login.show();
        $login.find(".message").html('');

    });
    //注册
    $register.find('a').on("click",function () {
        //通过ajax提交请求
        $.ajax({
            type:'post',
            url:'/api/user/register',
            data:{
                username:$register.find("[name='username']").val(),
                password:$register.find("[name='password']").val(),
                repassword:$register.find("[name='repassword']").val()
            },
            dataType:'json',
            success:function (result) {
                $register.find(".message").html(result.message);
            }
        })
    });
    //登录
    $login.find('a').on("click",function () {
       $.ajax({
           type:'post',
           url:'/api/user/login',
           data:{
               username:$login.find("[name='username']").val(),
               password:$login.find("[name='password']").val(),
           },
           dataType:'json',
           success:function (result) {
               $login.find(".message").html(result.message);
               if(!result.code){
                   window.location.reload();
               }
           }
       })
    });
    //退出登录
    $(".logOut").on('click',function () {
        $.ajax({
            url:'/api/user/logout',
            success:function (result) {
                if(!result.code){
                    window.location.reload();
                }
            }
        })
    });
});