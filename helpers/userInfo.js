const Account = require('../model/Account')
const register = require('./register')

async function getInfo(userId){
    try{
        const doc = await Account.findOne({_id: userId})

        return doc
    }
    catch(err){
        return {code:110, msg: 'db connection error'}
    }
}

async function updateIdentity(files, userId){
    try{
        const doc = await Account.findOne({_id: userId})
        
        if(doc){
            const id_front = register.moveFile(files.id_front[0], 'cmnd', doc.email)
            const id_back = register.moveFile(files.id_back[0], 'cmnd', doc.email)
            console.log('in here')
            console.log(id_front)
            const updatedDoc = await Account.updateOne({_id: userId}, {
                id_front, id_back, acc_status: 1, acc_info : 'Chờ xác minh'
            })

            return {code: 0, msg: 'Cap nhat anh CMND thanh cong'}
        }
    }
    catch(err){
        return {code:113, msg: 'Unexpected error when update ID'}
    }
}



module.exports = {
    getInfo,
    updateIdentity,
}