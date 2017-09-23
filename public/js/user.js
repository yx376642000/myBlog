$(function () {
    var $register = $("#register");
    var $login = $("#login");
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
                console.log(result);
            }
        })
    });
    $login.find('a').on("click",function () {
       $.ajax({
           type:'post',
           url:'/api/user/login',
           data:{
               username:$login.find("[name='username']").val(),
               password:$login.find("[name='password']").val()
           },
           dataType:'json',
           success:function (result) {
               console.log(result);
           }

       })
    });
});