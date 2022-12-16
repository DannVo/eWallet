const Account = require('../model/Account')
const TemporaryBanAccount = require('../model/TemporaryBanAccount')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const dotenv = require('dotenv').config({path: './.env'})

async function userLogin(username, password){
    const validate = validateAccount(username, password)
    
    const responseObject = await validate

    return responseObject
    
    //neu acc_status = 0 -> doi mk
    //acc_status != 0 -> direct thang toi trang chu

    //front end khi bat duoc json nay -> chuyen trang doi mat khau gom:
        //bat nhap username
        //bat nhap pass moi
        //bat nhap confirm pass moi
        //thanh cong:
        //update user: helpers/updateUser.js
        //update pass & acc_status + 1
        //front end chuyen thang den trang chu
}

async function validateAccount(username, password){
    try{
        const salt = bcrypt.genSaltSync(10)
        const hashPass = bcrypt.hashSync(password, salt)
        
        const doc = await Account.findOne({username: username})

        //check xem co bi khoa vinh vien hay khong
        if (doc.acc_status == -99) {
            return {
                code: 100,
                msg: 'Tài khoản đã bị vô hiêu hóa, vui lòng liên hệ tổng đài 18001008'
            }
        }

        //check xem co nam trong danh sach bi khoa 1 phut hay khong
        const existAccount = await TemporaryBanAccount.findOne({
            username: username,
        })

        if (existAccount) {
            return {code: 100, msg: 'Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút'}
        }

        //compare password
        const cmp = bcrypt.compareSync(password, doc.password)

        //sai mat khau
        if(!cmp) {
            const filter = {
                username: username
            }
            const wrongPassCount = doc.wrongPassCount
            if (wrongPassCount + 1 >= 3) {
                const temporaryBanAccount = new TemporaryBanAccount({
                    username: username,
                    password: hashPass
                })
                //khoa 1 phut
                return await temporaryBanAccount.save()
                .then(async () => {
                    const irregularCount = doc.irregularLogin
                    if (irregularCount + 1 >= 2) {
                        const update = {
                            acc_status: -99,
                            acc_info: 'ban'
                        }
                        return await Account.findOneAndUpdate(filter, update)
                        .then(() => {
                            return {
                                code: 100,
                                msg: 'Tài khoản đã bị khóa do nhập sai mật khẩu nhiều lần, vui lòng liên hệ quản trị viên để được hỗ trợ'
                            }
                        })
                    }
                    else {
                        const update = {
                            wrongPassCount: 0,
                            irregularLogin: irregularCount + 1
                        }
                        return await Account.findOneAndUpdate(filter, update)
                        .then(() => {
                            return {
                                code: 100,
                                msg: 'Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút'
                            }
                        })
                    }
                })
            }
            else {
                const update = {
                    wrongPassCount: wrongPassCount + 1
                }
                return await Account.findOneAndUpdate(filter, update)
                .then(() => {
                    return {
                        code: 101,
                        msg: 'Sai mật khẩu'
                    }
                })
            }
        }
        else {
            //reset dang nhap bat thuong
            const filter = {
                username: username
            }
            
            const update = {
                wrongPassCount: 0,
                irregularLogin: 0
            }
            
            const updAcc = await Account.findOneAndUpdate(filter, update, {
                new: true
            })
            
            //xu li JWT
            const accessToken = generateAccessToken(doc._id, doc.acc_status)
            const refreshToken = generateRefreshToken(doc._id, doc.acc_status)
            
            //luu cookie
            return {code: 0, msg: 'Dang nhap thanh cong', accessToken, refreshToken, status_for_direct: doc.acc_status}
        }
    }
    catch (err){
        return {code: 100, msg: 'Tai khoan khong ton tai'}
    }
}

function generateAccessToken(id, status){
    const accessToken = jwt.sign(
        { id, acc_status : status }, 
        process.env.SECRET_JWT_ACCESS_KEY,
        {expiresIn: process.env.ACCESS_TOKEN_EXP}
    )

    return accessToken
}

function generateRefreshToken(id, status){
    const refreshToken = jwt.sign(
        {
            id,
            acc_status: status,
        }, 
        process.env.SECRET_JWT_REFRESH_KEY,
        {expiresIn: process.env.REFRESH_TOKEN_EXP}
    )

    return refreshToken
}


//STORING TOKEN:
//1) local storage:
module.exports = {
    userLogin,
    generateAccessToken,
    generateRefreshToken,
}