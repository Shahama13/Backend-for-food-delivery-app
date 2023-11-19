const sendToken =(res,user,code)=>{
    const token = user.getToken();

    res.status(code).cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+process.env.COOKIE_EXPIRE*24*60*60*1000)
    }).json({
        success:true,
        token,
        user
    })

}
export default sendToken