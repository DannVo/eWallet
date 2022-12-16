const fs = require('fs')
const path = require('path')
const nodemailer = require('nodemailer')
const Account = require('../model/Account')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv').config({path: './.env'})

async function regisUser(fields, files, secondLevelFolder){

    //cau 1.1
    //thong tin dang ky tai khoan
    const phoneNumber = fields.phoneNumber[0]
    const hoten = fields.hoten[0]
    const dateBirth = fields.dateBirth[0]
    const address = fields.address[0]
    const email = fields.email[0]


    const cmndTruoc = files.cmndTruoc[0]
    const cmndSau = files.cmndSau[0]

    //cau 1.1
    //kiem tra email va sdt da ton tai hay chua
    const isEmailChecked = checkEmail(email)
    const isChecked = checkPhone(phoneNumber)
    const valueRegis = 
        //check email
        await isEmailChecked.then(async result => {
            if(result) 
            {
                return {code: 104, msg: 'Email nay da duoc dang ky'}
            }else{
                //check sdt
                const value = await isChecked.then(checked =>{
                    console.log("Kiem tra ",checked);
                    if(checked){
                        return {code: 104, msg: 'So dien thoai da ton tai'}
    
                    }
                    
                    return saveRegisAccount(phoneNumber, email, hoten, dateBirth, address, cmndTruoc, cmndSau, secondLevelFolder)
                })
                return value

            }
            
        }).then(lastResult => {
            if(lastResult.username){
                return {code: 0, msg: 'Register thanh cong', username: lastResult.username, pass:lastResult.password}  
            } 
        return lastResult
    })
    
    return valueRegis
}

function saveRegisAccount(phoneNumber, email, hoten, dateBirth, address, cmndTruoc, cmndSau, secondLevelFolder){
    ////move file
    const id_front = moveFile(cmndTruoc, secondLevelFolder, email)
    const id_back = moveFile(cmndSau, secondLevelFolder, email)

    ////tao random username, password
    const username = randomUsername()
    const password = randomPassword()

    ////add user to db
    const salt = bcrypt.genSaltSync(10)
    const hashPass = bcrypt.hashSync(password, salt)

    ////tien hanh add user moi
    const newAccount = new Account({
        username,
        password : hashPass,
        acc_status : 0,
        acc_info : 'default',
        phonenumber: phoneNumber,
        hoten: hoten,
        email,
        birth: dateBirth,
        address,
        id_front,
        id_back
    })

    newAccount.save().then(savedDoc => {
        //console.log('saved doc: ', savedDoc)
        if(savedDoc !== newAccount) {
            console.log({code: 103, msg: 'Unexpected error when add new account to DB'})
            return
        }
    
        mailing(email, username, password)
    })
    const new_accpass = {username, password}
    return new_accpass
}

async function checkEmail(email){
    try{
        const findEmail = await Account.findOne({email: email})
        //console.log('emai find one: ', findEmail)
        if(!findEmail) return false
        return true //true -> da ton tai
    }
    catch(err){
        return false //false -> chua ton tai 
    }
}
async function checkPhone(phone){
    try{
        const find_phone = await Account.findOne({phonenumber: phone})
        //console.log('emai find one: ', findEmail)
        if(!find_phone) return false
        return true 
    }
    catch(err){
        return false
    }
}

// cau 1.1 tao ten dang nhap 10 chu so
function randomUsername(){
    let name = ''

    for (let i = 0; i<10; i++){
        name += Math.floor(Math.random() * 10)
    }

    console.log("Ten tai khoan: ", name)
    return name
}

// cau 1.1 tao mat khau ngau nhien
function randomPassword(){
    let pass = "";
    const kytu = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    //toi da 6 ki tu
    for (var i = 0; i < 6; i++) {
        const num = Math.floor(Math.random() * kytu.length);
        // pass = kytu.substring(num+1, kytu.length);
        pass += kytu.substring(num, num +1);
    }
    console.log("Mat khau: ",pass)
    return pass

}

function moveFile(file, secondLevelFolder, destFolder){
    const oldPath = file.path 
    const dirPath = path.join(`public/images/${secondLevelFolder}`, destFolder)
    
    fs.mkdirSync(dirPath, { recursive: true })
    
    const newPath = __dirname + '/../public/images/' + secondLevelFolder + '/' + destFolder + '/' + file.originalFilename
    
    fs.copyFileSync(oldPath, newPath)
    //console.log('moved file')

    return dirPath + '/' + file.originalFilename
}

function mailing(receiverMail, username, pass){
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
        subject: "HiFi Ebanking default account",
        text: ` This is your username: \b${username}\n This is your pass: \b${pass}\n`
    }

    transporter.sendMail(mailOptions, (err) => {
        if(err) console.log('send email failed: ', err)
        else
            console.log('email sent')
    })
}
module.exports = {
    regisUser,
    moveFile,
}
