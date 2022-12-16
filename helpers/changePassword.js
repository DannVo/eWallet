const Account = require('../model/Account')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config({path: './.env'})
const nodemailer = require('nodemailer')

//kiem tra co thang nao < 6 ki tu khong
        //cai nay lam bang thu vien ngoai route
async function validateNewPass(user, newPass, confirmNewPass){
    try{
        const doc = await Account.findOne({_id: user.id })
        const cmp = bcrypt.compareSync(newPass, doc.password)

        //kiem tra newPass co trung voi pass trong db ko -> trung thi` bao loi
        if(cmp) return  {code: 112, msg : 'Mat khau moi khong the trung mat khau cu'}
        
        if(newPass !== confirmNewPass) return {code: 106, msg: 'Confirm pass is not match'}
        
        return null
    }
    catch(err){
        return {code: 110, msg : 'Unexpected error, check DB connection'}
    }
}

async function validateOldPass(user, oldPass, newPass){
    //kiem tra oldPass co trung voi db ko -> trung thi` di tiep
    try{
        const doc = await Account.findOne({_id: user.id})
        const cmp = bcrypt.compareSync(oldPass, doc.password)
        
        if(!cmp) return {code: 111, msg: 'Mat khau cu sai, khong the doi mat khau'}
        
        if(oldPass === newPass) return {code: 112, msg: 'Khong duoc nhap mat khau moi trung mat khau cu'}
        
        return null
    }
    catch(err){
        return {code: 110, msg : 'Unexpected error, when update new pass'}
    }
    
}

async function changePass(user, oldPass, newPass, confirmNewPass){
    //check if this is the right oldPass or not
    const handleValidateOldPass = await validateOldPass(user, oldPass, newPass)
    if(handleValidateOldPass) return handleValidateOldPass
    
    //tien hanh save to db - co san ham validate old pass
    const lastMsg = 
            await saveNewPassToDb(user, newPass, confirmNewPass)

    return lastMsg

}

async function saveNewPassToDb(user, newPass, confirmNewPass){

    const handleValidateNewPass = 
        await validateNewPass(user, newPass, confirmNewPass)
    if(handleValidateNewPass) return handleValidateNewPass
    
    //luu db
    const salt = bcrypt.genSaltSync(10)
    const hashPass = bcrypt.hashSync(newPass, salt)

    try
    {
        const updateQuery = 
            await Account.updateOne({_id: user.id}, { 
                password : hashPass,  
                acc_info : user.acc_status === 0 ? 'Chờ xác minh' : user.acc_info,
                acc_status : user.acc_status === 0 ? 1 : user.acc_status,
            })
        
        return  {code: 0, msg : 'Cap nhat mat khau moi thanh cong'}
    }
    catch(err){
        return {code: 110, msg : 'Unexpected error, when update new pass'}
    }
}


async function forgetPassword(email , phoneNumber, newPass, confirmNewPass){
    // console.log(email)
    // console.log(phoneNumber)
    //check if exists
    try{
        const doc = await Account.findOne({email: email, phonenumber : phoneNumber})
        if(!doc) return {code: 114, msg: 'Invalid email or phone number, please try again'}
        else{
            //create PIN
            const PIN = jwt.sign({
                id: doc._id,
                acc_status : doc.acc_status
            },process.env.SECRET_JWT_PIN, {expiresIn: '1m'} )
            //mailing -> mailing()
            mailing(email, PIN)

            //save new pass
            const saveNewPass = await saveNewPassToDb(doc, newPass, confirmNewPass)
            if(saveNewPass.code === 0)
                return { code: 0, msg: 'Send PIN through email and Update pass successfully' }
            //console.log('PIN from email: ', 'http://localhost:3000/users/reset_password/' + PIN)
            
        }   
    }
    catch(err){
        return {code:113, msg: 'Unexpected error when reset password'}
    }
}


function mailing(receiverMail, PIN){
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_FOR_SEND_HOST,
        port: process.env.EMAIL_FOR_SEND_PORT, 
        secure: false,
        auth: {
            user: process.env.EMAIL_FOR_SEND_NAME,
            pass: process.env.EMAIL_FOR_SEND_PASS
        },
        tls:{
            rejectUnauthorized: false,
        }
    })

    let mailOptions = {
        from: process.env.EMAIL_FOR_SEND_NAME,
        to: receiverMail,
        subject: "HiFi Ebanking reset password",
        text: ` This is your verify link - This link is only active in 1 minute: \n
            http://localhost:3000/users/reset_password/${PIN} \n `
    }

    transporter.sendMail(mailOptions, (err) => {
        if(err) console.log('send email failed: ', err)
        else
            console.log('email sent')
    })
}

module.exports = {
    changePass,
    saveNewPassToDb,
    forgetPassword,
}