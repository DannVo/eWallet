//////////////share
function navigateHighLight(){
  let currUrl = window.location.href.split('/')
  currUrl = currUrl[currUrl.length - 1]

  if(currUrl == ''){
    document
      .querySelector('.left_navbar-item.dashboard')
      .setAttribute('selected_nav', true)
  }else{
    const target = `.left_navbar-item.${currUrl}`
    document.querySelector(target).setAttribute('selected_nav', true)
  }

}

function userInfoLayout(){
  const userName = document.querySelector('.header_navbar-user_name')
  const userId = document.querySelector('.header_navbar-user_id.span')

  const authToken = `Bearer ${localStorage.getItem('accessToken')}`
  fetch('/users/userInfo', {
    method: 'get',
    headers: {
      'Authorization' : authToken,
      'Content-Type' : 'application/json'
    },
    redirect: 'follow',
  })
  .then(res => res.json())
  .then(data => {
    userName.innerText = data.hoten
    userId.innerText = data.username
  })
}


function handleSignOut(){
    
  fetch('/users/logout', {
    method: 'post',
    redirect: "follow"
  })
  .then(res => res.json())
  .then(data => {
    if(data.code === 0){
      
      window.location.href = '/login'
    }
      
  })
}

const layout = document.querySelector('.my_container')
if(layout){
  navigateHighLight()

  userInfoLayout()
  
}
  

function handleNavigate(div){
  const navTo = div.querySelector('.left_navbar-title').innerText

  //xu li hieu ung chon
  
  
  //chuyen trang
  if(navTo == 'Trang chủ'){
    window.location.href = "/"
  }
   
  if(navTo == 'Nạp / Rút')
    window.location.href = "/deposit_withdraw"
  if(navTo == 'Tài khoản')
    window.location.href = "/profile"
  if(navTo == 'Chuyển tiền')
    window.location.href = "/transfer"
  if(navTo == 'Mua thẻ')
    window.location.href = "/buy_cards"
}

$("input[data-type='currency']").on({
  keyup: function() {
    formatCurrency($(this));
  },
  blur: function() { 
    formatCurrency($(this), "blur");
  }
});


function formatNumber(n) {
  // format number 1000000 to 1,234,567
  return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }


  function formatCurrency(input, blur) {
  // appends $ to value, validates decimal side
  // and puts cursor back in right position.

  // get input value
  var input_val = input.val();

  // don't validate empty input
  if (input_val === "") { return; }

  // original length
  var original_len = input_val.length;

  // initial caret position 
  var caret_pos = input.prop("selectionStart");
    
  // check for decimal
  if (input_val.indexOf(".") >= 0) {

    // get position of first decimal
    // this prevents multiple decimals from
    // being entered
    var decimal_pos = input_val.indexOf(".");

    // split number by decimal point
    var left_side = input_val.substring(0, decimal_pos);
    var right_side = input_val.substring(decimal_pos);

    // add commas to left side of number
    left_side = formatNumber(left_side);

    // validate right side
    right_side = formatNumber(right_side);
    
    // On blur make sure 2 numbers after decimal
    if (blur === "blur") {
      right_side += "00";
    }
    
    // Limit decimal to only 2 digits
    right_side = right_side.substring(0, 2);

    // join number by .
    input_val = "" + left_side + "." + right_side;

  } else {
    // no decimal entered
    // add commas to number
    // remove all non-digits
    input_val = formatNumber(input_val);
    input_val = "" + input_val;
    
    //final formatting
    if (blur === "blur") {
      input_val += " VND";
    }
  }

  // send updated string to input
  input.val(input_val);

  // put caret back in the right position
  var updated_len = input_val.length;
  caret_pos = updated_len - original_len + caret_pos;
  input[0].setSelectionRange(caret_pos, caret_pos);
}


function convertMoneyAmount(text){
  const myStr = text.trim().split(' ')[0]
  const strArr = myStr.split(',')
  let intStr = ''

  strArr.forEach(str => {
    intStr += str
  })

  return parseInt(intStr)
}


///////format money function
function convertToStr(number){
  let formatedArr = []
	
  function formatMoney(amount){

    amount = parseInt(amount)

    if(amount < 1) return formatedArr

    formatedArr.push(amount%1000)

    return formatMoney(amount/1000)
  }
  
  const temp = formatMoney(number)
  let str = ''
  const lastIndex = temp.length - 1
  let count = 0

  temp.forEach(digit => {
    const lenDigit = digit.toString().length

    if(count === lastIndex){
      str = digit + ',' + str
    }else{
      if(digit === 0){
        str = '000,' + str
      }
      else if(digit <= 9){
        str = '00' + digit + ',' + str
      }
      else if(digit <= 99){
        str = '0' + digit + ',' + str
      }

      else
        str = digit + ',' + str
    }

    count ++
  })
	
  return str.slice(0, str.length - 1)
}

///////////////////////DASHBOARD
const dashboard = document.querySelector('.content_index')
if(dashboard){
  const authToken = `Bearer ${localStorage.getItem('accessToken')}`
  fetch('http://localhost:3000/users/histories', {
    headers: {
      'Authorization' : authToken,
      'Content-Type' : 'application/json'
    },
  })
  .then(res => res.json())
  .then(response => {
    const announcement = document.querySelector('.notifications-list.list-group.list-group-flush')
    announcement.innerHTML = ``
    const left = document.querySelector('.dashboard_history-left')
    const middle = document.querySelector('.dashboard_history-middle')
    const right = document.querySelector('.dashboard_history-right')
    left.innerHTML = `<h5 class="dashboard_history-title">Payment History</h5>`
    middle.innerHTML = `<div class="right_attribute-date">Date</div>`
    right.innerHTML = `<div class="right_attribute-debit">Debit</div>`
    if (response.code === 0) {
      response.data.forEach(history => {
        left.innerHTML += `
        <div class="transfer-source brief_box" onclick="viewTransferDetailInfo('${history._id}')">
                <div class="transfer-source_avatar-box">
                    <img src="/images/avatar/unknown_male.png" class="transfer-source-avatar" alt="avatar">
                </div>

            <div class="transfer-source_brief-box">
                <div class="transfer-source-name">
                  ${history.from}
                </div>
            </div>
        </div>`
        middle.innerHTML += `<div class="transfer-source">
        <div class="transfer-source-date">
          ${new Date(history.occurTime).toLocaleDateString("en-US")}
        </div>
        </div>`
        right.innerHTML += `<div class="transfer-source">
        <div class="transfer-source-debit receive">
          ${history.money.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})}
        </div>
        </div>`
      })
      response.announces.forEach(ann => {
        announcement.innerHTML += `<li class="notifications-item list-group-item">
        ${ann.message}
        </li>`
      })
    }
  })
  const balance = document.querySelector('.brief_info-user_data.balance')
  const value = parseInt(balance.innerText).toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
  balance.innerText = value
  function viewTransferDetailInfo(id){
    fetch('http://localhost:3000/users/histories', {
      headers: {
        'Authorization' : authToken,
        'Content-Type' : 'application/json'
      },
    })
    .then(res => res.json())
    .then(response => {
      if (response.code == 0) {
        response.data.forEach(history => {
          if (history._id == id) {
            let type = ``
            let bgColor = ``
            let stt = ``
            switch (history.status) {
              case '-1':
                stt = `Rejected`
                bgColor = `red`
                break;
              case '0': 
                stt = 'Pending'
                bgColor = 'yellow'
                break
              case '1':
                stt = 'Fulfilled'
                bgColor = 'green'
                break
              default:
                break;
            }
            switch(history.transferType) {
              case '1': 
                type = `${history.icon} Recharge`
                break;
              case '2': 
                type = `Withdraw`
                break;
              case '3': 
                type = `Transfer`
                break;
              case '4':
                type = `<span onclick='detailsCards(${JSON.stringify(history.phoneCardNumber)})'>Purchase phone cards (click for details)</span>`
                break;
              default:
                type = 'Can not determine'
                break;
            }
            const modal = document.querySelector('#transferDetail')
            const actor = modal.querySelector('.detail_box-value.username')
            const transferType = modal.querySelector('.detail_box-value.transferType')
            const status = modal.querySelector('.detail_box-value.status')
            const amount = modal.querySelector('.detail_box-value.amount')
            const occur = modal.querySelector('.detail_box-value.occur')
            const fee = modal.querySelector('.detail_box-value.fee')
            const message = modal.querySelector('.detail_box-value.message')
            actor.innerText = history.from;
            transferType.innerHTML = type
            status.innerText = stt;
            status.style.backgroundColor = bgColor
            amount.innerText = history.money.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})
            occur.innerText = new Date(history.occurTime).toLocaleDateString('en-US')
            fee.innerText = history.transactionFee.toLocaleString('it-IT', {style : 'currency', currency : 'VND'})
            message.innerText = history.message;

            if (history.transferType == '4') {
              transferType.style.cursor = 'pointer'
            }

            $('#transferDetail').modal('show')
          }
        })
      }
    })
  }

  function detailsCards(cards) {
    const phoneCards = document.querySelector('.dashboard_purchase_success-box')
    phoneCards.innerHTML = ``
    let internetService = cards[0].substring(0, 5)
    internetService = (internetService == '11111') ? 'Viettel' : (internetService == '22222' ? 'Mobifone' : 'Vinaphone')
    cards.forEach(card => {
      phoneCards.innerHTML += `<h6 class="purchase_success-box_title">${card} - ${internetService}</h6>`
    })
    $('#transferDetail').modal('hide')
    $('#dashboard_card_detail').modal('show')
  }
}




/////////////////////////PROFILE
const profile = document.querySelector('.account_content')
if(profile){
    const authToken = `Bearer ${localStorage.getItem('accessToken')}`
    //render update ID form
    const leftHalf = profile.querySelector('.left-half')

    const form = document.createElement('form')
    form.classList.add('profile_update-id_wrapper')
    form.setAttribute('enctype', 'multipart/form-data')
    form.setAttribute('action', '/users/updateIdentityCard')
    form.setAttribute('method', 'post')

    const content = `
      <div class="input_form">
          <p class="input_form-title front_id">Front ID image: </p>
          <input type="file" name = "id_front" class="input_form-holder front_id" accept="image/*">
      </div>


      <div class="input_form">
          <p class="input_form-title">Back ID image: </p>
          <input type="file" name="id_back" class="input_form-holder back_id " accept="image/*">
      </div>

      
      <div class="input_form">
          <p class="input_form-title submission">Update ID images: </p>
          <span class="update_id-span"></span>
          <button type = "submit" class="btn btn-primary input_form-pass_btn">Update</button>
      </div>
    `

    form.innerHTML = content;

    function renderUserInfo(){
      const username = document.querySelector('.input_form-holder.username')
      const email = document.querySelector('.input_form-holder.email')
      const address = document.querySelector('.input_form-holder.address')
      const fullName = document.querySelector('.input_form-holder.full_name')
      const contact = document.querySelector('.input_form-holder.phone_number')
      const dateBirth = document.querySelector('.input_form-holder.date_birth')
      const status = document.querySelector('.input_form-holder.status')

      
      fetch('/users/userInfo', {
        method: 'get',
        headers: {
          'Authorization' : authToken,
          'Content-Type' : 'application/json'
        },
        redirect: 'follow',
      })
      .then(res => res.json())
      .then(data => {
        let birth = new Date(data.birth)
        birth = birth.getFullYear() + '-'  + (birth.getMonth() + 1) + '-' + birth.getDate() 
        //console.log(data)
        //console.log(birth)
        username.innerText = data.username
        email.innerText = data.email
        address.innerText = data.address
        fullName.innerText = data.hoten
        contact.innerText = data.phonenumber
        dateBirth.innerText = birth
        status.innerText = data.acc_info

        if(data.acc_status === 3){
          leftHalf.appendChild(form)
          updateIdImage()
        }
      })
      .catch(err => {
        //loi vi token het han -> ban ra login
        window.location.href = '/login'
      })
    }

    renderUserInfo() 


    //update ID image
    function updateIdImage(){
      form.addEventListener('submit', e => {
        e.preventDefault()
  
        const body = new FormData(e.target)
  
        fetch('/users/updateIdentityCard', {
          method: 'put',
          headers: {
            'Authorization' : authToken,
          },
          body
        })
        .then(res => res.json())
        .then(data => {
          location.reload()
        })
      })
    }
    
}



////////////////////////LOGIN
const login = document.querySelector('.login_content')
if(login){


  function validateLogin(username, password){
    let errors = []
    username = username.toString()
    if(!username){
      errors.push({type: 1, msg: 'Missing username'})
    }
    if(username.length < 5 && username.length !== 0){
      errors.push({type: 1, msg: 'Username is a string of 10 digits'})
    }

    if(!password){
      errors.push({type: 2, msg: 'Missing password'})
    }
    if(password.length < 6 && password.length !== 0){
      errors.push({type: 2, msg: 'At least 6 char for password'})
    }

    return errors
  }


  function handleLogin(){
    const username = document.querySelector('#login_box-username').value
    const password = document.querySelector('#login_box-password').value
    const renderLast = document.querySelector('.login_box-msg.last')
    const renderUsername = document.querySelector('.login_box-msg.username')
    const renderPass = document.querySelector('.login_box-msg.pass')

    renderLast.innerText = ''
    renderUsername.innerText = ''
    renderPass.innerText = ''

    const errors = validateLogin(username, password)
    if(errors.length > 0){
      errors.forEach(err => {
        if(err.type === 1){
          renderUsername.innerText = err.msg
        }else{
          renderPass.innerText = err.msg
        }
      })
    }
    else{
      console.log('in here')
      fetch('/users/login', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          username, password
        }),
        redirect: 'follow'
      })
      .then(res => res.json())
      .then(data => {
        console.log(data)
        if(data.code === 0){
          const status = data.status_for_direct

          localStorage.setItem('accessToken', data.accessToken)
  
          return status //good to go 
        }
        return data.msg
      })
      .then(lastRes => {
        if(lastRes === -1){
          renderLast.innerText = 'Your password has been deactivated, please contact 18001008'
        }
        else if(lastRes === 0){
          window.location.href = '/first_change'
        }
        else if(lastRes === 200){
          window.location.href = '/admin'
        }
        else if(lastRes >= 1)
          window.location.href = '/'
        
        else{
          renderLast.innerText = lastRes
        }
      })
    }
    
    
  }
}

//////////////FORGET PASS
const forget_pass = document.querySelector('.login_content.forget_pass')
if(forget_pass){

  function validateForgetPass(email, phoneNumber, pass, confirmPass){
    let errors = []
    
    if(!email){
      errors.push({type: 1, msg: 'Missing email'})
    }
    else if(!validateEmail(email))
      errors.push({type: 1, msg: 'Invalid email type'})

    if(!phoneNumber){
      errors.push({type: 2, msg: 'Missing phone number'})
    }
    else if(phoneNumber.length < 10)
      errors.push({type: 2, msg: 'Phone number must be at least 10 digits'})

    if(!pass){
      errors.push({type: 3, msg: 'Missing password'})
    }
    else if(pass.length < 6)
      errors.push({type: 3, msg: 'Password must be at least 6 char'})

    if(!confirmPass){
      errors.push({type: 4, msg: 'Missing confirm password'})
    }
    else if(confirmPass !== pass)
      errors.push({type: 4, msg: 'Confirm password must be identical to password'})

    return errors
  }

  function handleForgetPass(){

    const email = document.querySelector('#forget_pass-email')
    const phoneNumber = document.querySelector('#forget_pass-phone_num')
    const pass = document.querySelector('#forget_pass-new_pass')
    const confirmPass = document.querySelector('#forget_pass-reenter_pass')
    const lastSpan = forget_pass.querySelector('.login_box-msg.last')

    lastSpan.innerText = ''
    email.parentElement.querySelector('.login_box-msg').innerText = ''
    phoneNumber.parentElement.querySelector('.login_box-msg').innerText = ''
    pass.parentElement.querySelector('.login_box-msg').innerText = ''
    confirmPass.parentElement.querySelector('.login_box-msg').innerText = ''
    
    //console.log(email, phoneNumber, pass, confirmPass)
    const errors = validateForgetPass(email.value, phoneNumber.value, pass.value, confirmPass.value)

    if(errors.length > 0){
      errors.forEach(err => {
        if(err.type === 1)
          email.parentElement.querySelector('.login_box-msg').innerText = err.msg
        if(err.type === 2)
         phoneNumber.parentElement.querySelector('.login_box-msg').innerText = err.msg
        if(err.type === 3)
          pass.parentElement.querySelector('.login_box-msg').innerText = err.msg
        if(err.type === 4)
          confirmPass.parentElement.querySelector('.login_box-msg').innerText = err.msg

      })
    }else{
      ////validate xong roi moi cho phep fetch
      fetch('users/forgetPassword', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: email.value, 
          phoneNumber: phoneNumber.value, 
          pass: pass.value, 
          confirmPass: confirmPass.value
        })
      })
      .then(res => res.json())
      .then(data => {
        //data.code !== 0 => render loi ra day
        if(data.code !== 0){
          lastSpan.innerText = data.msg
        }else{
          lastSpan.style.color = 'green'
          lastSpan.innerText = data.msg
        }
      })
    }

    
  }
}


/////////////CHANGE PASS
const change_pass = document.querySelector('.change_pass')
if(change_pass){
  function validateChangePass(old, newPass, confirm){
    let errors = []

    if(!old){
      errors.push({type: 1, msg: 'Missing old password'})
    }
    else if(old.length < 6){
      errors.push({type: 1, msg: 'Password must be at least 6 char'})
    }

    if(!newPass){
      errors.push({type: 2, msg: 'Missing new pass password'})
    }
    else if(newPass.length < 6){
      errors.push({type: 2, msg: 'New password must be at least 6 char'})
    }

    if(!confirm){
      errors.push({type: 3, msg: 'Missing confirm password'})
    }
    else if(confirm !== newPass){
      errors.push({type: 3, msg: 'Confirm password must be indentical new password'})
    }

    return errors
  }

  function handleChangePass(){
    const oldPassword = document.querySelector('#change_pass-old_pass')
    const newPassword = document.querySelector('#change_pass-new_pass')
    const confirmPassword = document.querySelector('#change_pass-reenter_pass')
    const authToken = `Bearer ${localStorage.getItem('accessToken')}`
    const lastMsg = change_pass.querySelector('.login_box-msg.last')

    oldPassword.parentElement.querySelector('.login_box-msg').innerText = ''
    newPassword.parentElement.querySelector('.login_box-msg').innerText = ''
    confirmPassword.parentElement.querySelector('.login_box-msg').innerText = ''
    lastMsg.innerText = ''

    const errors = validateChangePass(oldPassword.value, newPassword.value, confirmPassword.value)

    if(errors.length > 0){
      errors.forEach(err => {
        if(err.type === 1)
          oldPassword.parentElement.querySelector('.login_box-msg').innerText = err.msg

        if(err.type === 2)
          newPassword.parentElement.querySelector('.login_box-msg').innerText = err.msg
        
        if(err.type === 3)
          confirmPassword.parentElement.querySelector('.login_box-msg').innerText = err.msg   
      })
    }else{
      //////validate thanh cong thi moi duoc fetch
      fetch('/users/changePassword', {
        method: 'put',
        headers: {
          'Authorization' : authToken,
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
          oldPassword: oldPassword.value, 
          newPassword: newPassword.value, 
          confirmPassword: confirmPassword.value
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log(data)
        if(data.code === 0){
          window.location.href = '/'
        }else{
          lastMsg.innerText = data.msg
        }
      })
    }
    
  }
}

// xu ly lan dau dang nhap
const first_change = document.querySelector('.first_change')
if(first_change){
  function handleFirstChange(){
    const newPassword = document.querySelector('#first_change-new_pass').value
    const confirmPassword = document.querySelector('#first_change-reenter_pass').value
    const authToken = `Bearer ${localStorage.getItem('accessToken')}`

    console.log(newPassword, confirmPassword, authToken)
    
    //validate xong moi duoc fetch
    fetch('http://localhost:3000/users/changePassword/firstLogin', {
      method: 'put',
      headers: {
        'Authorization': authToken,
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({newPassword, confirmPassword})
    })
    .then(res => res.json())
    .then(data => {
      console.log(data)
      if(data.code === 0){
        window.location.href = '/'
      }
    })
  }
}

const validateEmail = (email) => {
  return String(email)
      .toLowerCase()
      .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
}


//REGISTER
const register = document.querySelector('.login_content.register')
if(register){

  function validateRegister(fullName, email, dateBirth, address, frontId, backId, phoneNumber){
    let errors = []

    if(!fullName) errors.push({type: 1, msg: 'Missing full name'})

    if(!email) errors.push({type: 2, msg: 'Missing email'})
    else if(!validateEmail(email))
      errors.push({type: 2, msg: 'Wrong email format'})

    if(!address) errors.push({type: 3, msg: 'Missing address'})

    if(!frontId) errors.push({type: 4, msg: 'Missing ID front image'})

    if(!backId) errors.push({type: 5, msg: 'Missing id back image'})

    if(!phoneNumber) errors.push({type: 6, msg: 'Missing phone number'})

    if(!dateBirth) errors.push({type: 7, msg: 'Missing date of birth'})
    else{
      const myDate = new Date(dateBirth)
      const today = new Date()
      
      if(myDate > today)
        errors.push({type: 7, msg: 'Invalid date'})
      else if(today.getFullYear() - myDate.getFullYear() < 18)
        errors.push({type: 7, msg: 'Must be at least 18 years old'})
    }
    return errors
  }

  register.addEventListener('submit', e => {
    e.preventDefault()
    const fullName = register.querySelector('#register_box-name')
    const email = register.querySelector('#register_box-email')
    const dateBirth = register.querySelector('#register_box-date_birth')
    const address = register.querySelector('#register_box-address')
    const frontId = register.querySelector('#register_box-id_front')
    const backId = register.querySelector('#register_box-id_back')
    const phoneNumber = register.querySelector('#register_box-phone')

    const lastMsg = register.querySelector('.login_box-msg.last')

    lastMsg.innerHTML = ''
    fullName.parentElement.querySelector('.login_box-msg').innerText = ''
    email.parentElement.querySelector('.login_box-msg').innerText = ''
    dateBirth.parentElement.querySelector('.login_box-msg').innerText = ''
    address.parentElement.querySelector('.login_box-msg').innerText = ''
    frontId.parentElement.querySelector('.login_box-msg').innerText = ''
    backId.parentElement.querySelector('.login_box-msg').innerText = ''
    phoneNumber.parentElement.querySelector('.login_box-msg').innerText = ''
    
    const errors = 
      validateRegister(fullName.value, email.value, dateBirth.value, address.value, frontId.value, backId.value, phoneNumber.value)
    
    if(errors.length > 0){
      errors.forEach(err => {
        if(err.type === 1)
          fullName.parentElement.querySelector('.login_box-msg').innerText = err.msg
        if(err.type === 2)
          email.parentElement.querySelector('.login_box-msg').innerText = err.msg
        if(err.type === 3)
          address.parentElement.querySelector('.login_box-msg').innerText = err.msg
        if(err.type === 4)
          frontId.parentElement.querySelector('.login_box-msg').innerText = err.msg
        if(err.type === 5)
          backId.parentElement.querySelector('.login_box-msg').innerText = err.msg
        if(err.type === 6)
          phoneNumber.parentElement.querySelector('.login_box-msg').innerText = err.msg
        if(err.type === 7)
          dateBirth.parentElement.querySelector('.login_box-msg').innerText = err.msg
      })
    }else{
      const body = new FormData(e.target)

      fetch('/users/register', {
        method: 'post',
        body,
      })
      .then(res => res.json())
      .then(data => {
        if(data.code !== 0){
          lastMsg.innerHTML = data.msg
        }else{
          window.location.href = '/login'
        }
      })
    }
    
  })
}

///////////////////////////ADMIN

const changeDateDB = (str) => {
  const date = new Date(str)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const year = date.getFullYear()

  return day + '-' + month + '-' + year
}

function handleProfile(id) {
  fetch(`/admin/search/${id}`)
  .then(res => res.json())
  .then(response => {

    const profileModal = document.querySelector('#showFullInfoModal')
    const userName = profileModal.querySelector('.modal_info-username')
    const email = profileModal.querySelector('.modal_info-email')
    const address = profileModal.querySelector('.modal_info-address')
    const frontId = profileModal.querySelector('.modal_info-front_id')
    const backId = profileModal.querySelector('.modal_info-back_id')
    const name = profileModal.querySelector('.modal_info-fullname')
    const phone = profileModal.querySelector('.modal_info-phone')
    const birthDay = profileModal.querySelector('.modal_info-birth')
    
    userName.innerText = response.data.username ||'';
    email.innerText = response.data.email || '';
    address.innerText = response.data.address || '';
    name.innerText = response.data.hoten;
    phone.innerText = response.data.phonenumber;
    birthDay.innerText = changeDateDB(response.data.birth)

    frontId.setAttribute('src', response.data.id_front.slice(6) || '')
    backId.setAttribute('src', response.data.id_back.slice(6) || '')

    var myModal = new bootstrap.Modal(document.getElementById('showFullInfoModal'), {
      keyboard: false
    })
    myModal.show()
  })
}

function handleAuth(id){
  fetch('/admin/activateAccount', {
    method: 'put',
    headers: {'Content-Type' : 'application/json'},
    body: JSON.stringify({id})
  })
  .then(res => res.json())
  .then(data => {
    if(data.code === 0){
      location.reload()
    }
  })
  
}

function handleDeactive(id){
  fetch('/admin/deactivateAccount', {
    method: 'put',
    headers: {'Content-Type' : 'application/json'},
    body: JSON.stringify({id})
  })
  .then(res => res.json())
  .then(data => {
    if(data.code === 0){
      location.reload()
    }
  })
}

function handleActivateModal(id, username){
  const myModal = new bootstrap.Modal(document.getElementById('confirmChangeModal'), {
    keyboard: false
  })

  myModal.show()

  document.querySelector('.admin_modal-confirm_title').innerText = `Are you sure to activate user ${username}`

  document.querySelector('.admin_modal-confirm_btn').addEventListener('click', e => {
    handleAuth(id)
  })
}

function handleDeactiveModal(id, username){
  const myModal = new bootstrap.Modal(document.getElementById('confirmChangeModal'), {
    keyboard: false
  })

  myModal.show()

  document.querySelector('.admin_modal-confirm_title').innerText = `Are you sure to deactivate user ${username}`

  document.querySelector('.admin_modal-confirm_btn').addEventListener('click', e => {
    handleDeactive(id)
  })
}


function handleRequireIdModal(id, username){
  const myModal = new bootstrap.Modal(document.getElementById('confirmChangeModal'), {
    keyboard: false
  })

  myModal.show()

  document.querySelector('.admin_modal-confirm_title').innerText = `Are you sure to require ID images from user ${username}`

  document.querySelector('.admin_modal-confirm_btn').addEventListener('click', e => {
    handleRequireId(id)
  })
}

function handleRequireId(id){
  fetch('/admin/requireCertificate', {
    method: 'put',
    headers: {'Content-Type' : 'application/json'},
    body: JSON.stringify({id})
  })
  .then(res => res.json())
  .then(data => {
    if(data.code === 0){
      location.reload()
    }
  })
}
const pendingPage = document.querySelector('#waiting-content')
if (pendingPage) {

  //render UI
  fetch('/admin/pending')
  .then(res => res.json())
  .then(response => {
    if (response.code === 0) {
      const pendingAccountsList = document.querySelector('.pending_accounts-list')
      pendingAccountsList.innerHTML = ``
      response.data.forEach((account) => {

        pendingAccountsList.innerHTML += `<div class="view-task border border-3 rounded">
                <div class="task-detail p-2"> 
                    <p class="task-people h5">Username: <span class="task-people-name h5 font-italic">${account.username}</span> </p>
                    <p class="task-describe h6">
                        Ngày khởi tạo: ${changeDateDB(account.createdAt)}
                    </p>
                </div>

                <button 
                  type="button" 
                  class="container_btn--primary btn btn-outline-success p-2"
                  onclick = "handleActivateModal('${account._id}', '${account.username}')"
                >
                  <i style="margin-right: 6px;" class="fa fa-check" aria-hidden="true"></i>Xác minh
                </button>

                <button 
                  type="button" 
                  class="container_btn--primary btn btn-outline-danger p-2"
                  onclick = "handleDeactiveModal('${account._id}', '${account.username}')"
                >
                  <i style="margin-right: 6px;" class="fa-solid fa-x"></i></i>Hủy
                </button>

                <button 
                  type="button" 
                  class="container_btn--primary btn btn-outline-warning p-2"
                  onclick = "handleRequireIdModal('${account._id}', '${account.username}')"
                >
                  <i style="margin-right: 6px;" class="fa-solid fa-file"></i></i>Yêu cầu bổ sung thông tin
                </button>

                <button  
                  onclick="handleProfile('${account._id}')" 
                  id="pending_accounts-profile-btn" 
                  type="button" 
                  class="container_btn--primary btn btn-outline-info p-2" 
                >
                  <i style="margin-right: 6px;" class="fa-solid fa-circle-info"></i></i>Xem thông tin chi tiết
                </button>
            </div>`
      })
    }
  })
  
  

}

const activatedPage = document.querySelector('#activated-content')
if (activatedPage) {
  fetch('/admin/fulfilled')
  .then(res => res.json())
  .then(response => {
    if (response.code === 0) {
      const activatedAccountsList = document.querySelector('.activated_accounts-list')
      activatedAccountsList.innerHTML = ``
      response.data.forEach((account) => {

        activatedAccountsList.innerHTML += `<div class="view-task border border-3 rounded">
                <div class="task-detail p-2"> 
                    <p class="task-people h5">Username: <span class="task-people-name h5 font-italic">${account.username}</span> </p>
                    <p class="task-describe h6">
                        Ngày khởi tạo: ${changeDateDB(account.createdAt)}
                    </p>
                </div>
                
                <button  
                  onclick="handleProfile('${account._id}')" 
                  id="pending_accounts-profile-btn" 
                  type="button" 
                  class="container_btn--primary btn btn-outline-info p-2" 
                  >
                    <i style="margin-right: 6px;" class="fa-solid fa-circle-info"></i></i>Xem thông tin chi tiết
                  </button>
            </div>`
      })
    }
  })

  
}

function handleUnlockModal(id, username){
  const myModal = new bootstrap.Modal(document.getElementById('confirmChangeModal'), {
    keyboard: false
  })

  myModal.show()

  document.querySelector('.admin_modal-confirm_title').innerText = `Are you sure to unlock user ${username}`

  document.querySelector('.admin_modal-confirm_btn').addEventListener('click', e => {
    handleAuth(id)
  })
}

const banPage = document.querySelector('#ban-content')
if (banPage) {
  //render UI
  fetch('/admin/lock')
  .then(res => res.json())
  .then(response => {
    if (response.code === 0) {
      const banAccountsList = document.querySelector('.ban_accounts-list')
      banAccountsList.innerHTML = ``
      response.data.forEach((account) => {
        console.log(account)
        banAccountsList.innerHTML += `<div class="view-task border border-3 rounded">
                <div class="task-detail p-2"> 
                    <p class="task-people h5">Username: <span class="task-people-name h5 font-italic">${account.username}</span> </p>
                    <p class="task-describe h6">
                        Ngày khởi tạo: ${changeDateDB(account.createdAt)}
                    </p>
                </div>
                
                <button 
                  type="button" 
                  class="container_btn--primary btn btn-success p-2"
                  onclick = "handleUnlockModal('${account._id}', '${account.username}')"
                >
                  <i style="margin-right: 6px;" class="fa fa-check" aria-hidden="true"></i>Unlock
                </button>

                <button  
                  onclick="handleProfile('${account._id}')" 
                  id="pending_accounts-profile-btn" 
                  type="button" class="container_btn--primary btn btn-outline-info p-2" 
                >
                  <i style="margin-right: 6px;" class="fa-solid fa-circle-info"></i></i>Xem thông tin chi tiết
                </button>
            </div>`
      })
    }
  })

}

const deactivatedPage = document.querySelector('#deactivated-content')
if (deactivatedPage) {

  //handleActiveModal

  fetch('/admin/rejected')
  .then(res => res.json())
  .then(response => {
    if (response.code === 0) {

      const deactivatedAccountsList = document.querySelector('.deactivated_accounts-list')
      deactivatedAccountsList.innerHTML = ``

      response.data.forEach((account) => {
        
        deactivatedAccountsList.innerHTML += `<div class="view-task border border-3 rounded">
                <div class="task-detail p-2"> 
                    <p class="task-people h5">Username: <span class="task-people-name h5 font-italic">${account.username}</span> </p>
                    <p class="task-describe h6">
                        Ngày khởi tạo: ${changeDateDB(account.createdAt)}
                    </p>
                </div>
                <button 
                  type="button" 
                  class="container_btn--primary btn btn-success p-2"
                  onclick = "handleActivateModal('${account._id}','${account.username}')"
                >
                  <i style="margin-right: 6px;" class="fa fa-check" aria-hidden="true"></i>Activate
                </button>

                <button  
                  onclick="handleProfile('${account._id}')" 
                  id="pending_accounts-profile-btn" 
                  type="button" 
                  class="container_btn--primary btn btn-outline-info p-2" 
                >
                  <i style="margin-right: 6px;" class="fa-solid fa-circle-info"></i></i>Xem thông tin chi tiết
                </button>
            </div>`
      })
    }
  })

}

const transfer_admin = document.querySelector('#admin_transfer-content')
if(transfer_admin){

  fetch('/admin/render_transfer')
  .then(res => res.json())
  .then(data => {
    if(data.code === 0){
      const transferList = document.querySelector('#admin_transfer-list')
      transferList.innerText = ''

      data.data.forEach(transfer => {
        transferList.innerHTML += `
        <div class="view-task border border-3 rounded" >
          <div class="task-detail p-2"> 
              <span class="task-name h4">Chuyển tiền</span>
                  <p class="task-people h5">From: <span class="task-people-name h5 font-italic">${transfer.actor}</span>
                      <br>
                          To: ${transfer.receiver}
                  </p>
                  <p class="task-describe h6">
                      Số tiền chuyển: ${convertToStr(transfer.money)} VNĐ.<br>
                      Lời nhắn: ${transfer.message}<br>
                  </p>
                  <p>
                      Ngày giao dịch: ${changeDateDB(transfer.updatedAt)}
                  </p>
          </div>

          <button 
            type="button" 
            class="container_btn--primary btn btn-outline-danger p-2" 
            onclick = "rejectTransferModal('${transfer._id}')"
          >
            <i style="margin-right: 6px;" class="fa-solid fa-x"></i></i>Từ chối
          </button>
          
          <button 
            type="button" 
            class="container_btn--primary btn btn-outline-success p-2"
            onclick = "acceptTransferModal('${transfer._id}')" 
          >
            <i style="margin-right: 6px;" class="fa fa-check" aria-hidden="true"></i>Chấp thuận
          </button>
        </div>
        
        `
      })
    }
  })
}

function rejectTransferModal(id){
  const myModal = new bootstrap.Modal(document.getElementById('confirmChangeModal'), {
    keyboard: false
  })

  myModal.show()

  document.querySelector('.admin_modal-confirm_title').innerText = `Are you sure to reject this transfer`

  document.querySelector('.admin_modal-confirm_btn').addEventListener('click', e => {
    handleRejectTransfer(id)
  })
}

function handleRejectTransfer(id){

  fetch('/admin/transfer_approvement', {
    method: 'put',
    headers: {'Content-Type' : 'application/json'},
    body: JSON.stringify({id, isApproved: false})
  })
  .then(res => res.json())
  .then(data => {
    if(data.code === 0) location.reload()
  })

}

function acceptTransferModal(id){
  const myModal = new bootstrap.Modal(document.getElementById('confirmChangeModal'), {
    keyboard: false
  })

  myModal.show()

  document.querySelector('.admin_modal-confirm_title').innerText = `Are you sure to approve this transfer`

  document.querySelector('.admin_modal-confirm_btn').addEventListener('click', e => {
    handleApproveTransfer(id)
  })
}

const admin_withdraw = document.querySelector('#admin_withdraw-content')
if(admin_withdraw){

  fetch('/admin/render_withdraw')
  .then(res => res.json())
  .then(data => {
    if(data.code === 0){
      const withdrawList = document.querySelector('#admin_withdraw-list')
      withdrawList.innerText = ''

      data.data.forEach(withdraw => {
        withdrawList.innerHTML += `
          <div class="view-task border border-3 rounded">
              <div class="task-detail p-2"> 
                  <span class="task-name h4">Rút tiền</span>
                      <p class="task-people h5">From: <span class="task-people-name h5 font-italic">${withdraw.actor}</span>
                          <br>
                              To: ${withdraw.receiver}
                      </p>
                      <p class="task-describe h6">
                          Số tiền chuyển: ${convertToStr(withdraw.money)} VNĐ.<br>
                          Lời nhắn: ${withdraw.message}<br>
                      </p>
                      <p>
                          Ngày giao dịch: ${changeDateDB(withdraw.updatedAt)}
                      </p>
              </div>
              <button 
                type="button" 
                class="container_btn--primary btn btn-outline-danger p-2" 
                onclick = "rejectWithdrawModal('${withdraw._id}')"
              >
                <i style="margin-right: 6px;" class="fa-solid fa-x"></i></i>Từ chối
              </button>

              <button 
                type="button" 
                class="container_btn--primary btn btn-outline-success p-2" 
                onclick = "approveWithdrawModal('${withdraw._id}')"
              >
                <i style="margin-right: 6px;" class="fa fa-check" aria-hidden="true"></i>Chấp thuận
              </button>
          </div>
        `
      })
    }
  })
}

function rejectWithdrawModal(id){
  const myModal = new bootstrap.Modal(document.getElementById('confirmChangeModal'), {
    keyboard: false
  })

  myModal.show()

  document.querySelector('.admin_modal-confirm_title').innerText = `Are you sure to reject this withdraw?`

  document.querySelector('.admin_modal-confirm_btn').addEventListener('click', e => {
    handleRejectWithdraw(id)
  })
}

function handleRejectWithdraw(id){

  fetch('/admin/withdraw_approvement', {
    method: 'put',
    headers: {'Content-Type' : 'application/json'},
    body: JSON.stringify({id, isApproved: false})
  })
  .then(res => res.json())
  .then(data => {
    if(data.code === 0) location.reload()
  })
}

function approveWithdrawModal(id){
  const myModal = new bootstrap.Modal(document.getElementById('confirmChangeModal'), {
    keyboard: false
  })

  myModal.show()

  document.querySelector('.admin_modal-confirm_title').innerText = `Are you sure to approve this withdraw?`

  document.querySelector('.admin_modal-confirm_btn').addEventListener('click', e => {
    handleApproveWithdraw(id)
  })
}

function handleApproveWithdraw(id){
  fetch('/admin/withdraw_approvement', {
    method: 'put',
    headers: {'Content-Type' : 'application/json'},
    body: JSON.stringify({id, isApproved: true})
  })
  .then(res => res.json())
  .then(response => {
    if (response.code === 0) {
      location.reload()
    }
  })
}

//transfer_admin
function handleApproveTransfer(id){
  fetch('/admin/transfer_approvement', {
    method: 'put',
    headers: {'Content-Type' : 'application/json'},
    body: JSON.stringify({id, isApproved: true})
  })
  .then(res => res.json())
  .then(data => {
    if(data.code === 0) location.reload()
  })

}

///////////////////////////////////// TAN LOI //////////////////////////
////////////////////////TRANSFER
const transfer = document.querySelector('.transfer_content')

if(transfer){
  const userBalanceUi = document.querySelector('.form_balance-amount.balance')
  const userBalanceValue = parseInt(userBalanceUi.innerText).toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
  userBalanceUi.innerText = userBalanceValue

  let targetInfo = {}
  const searchInput = document.querySelector('.payee_box-input_holder')
  searchInput.addEventListener('input', function(e) {
    const value = e.target.value;
    if (value !== '') {
      fetch(`http://localhost:3000/search/${value}`, {
        method: 'POST',
      })
      .then(res => res.json())
      .then(response => {
        const usersList = document.querySelector('.payee_box-accounts_users')
        usersList.innerHTML = ``;
        if (response.code == 0) {
          response.data.forEach(user => {
            targetInfo[user.username] = user.email
            usersList.innerHTML += `<div class="payee_box-accounts_users-wrapper" onclick="handleChooseAccount(this)">
            <div class="accounts_users-item">
            <img class = "accounts_users-item_img" src="images/avatar/unknown_male.png" alt="avatar">
            </div>
            <div class="accounts_users-item_info">
            <p class="accounts_users-item_name">${user.hoten}</p>
            <p class="accounts_users-item_id text-warning">#${user.username}</p>
            </div>
            </div>`
          })
        }
      })
    }
  })
    function resetSearch(){
      const searchInput = document.querySelector('.payee_box-input_holder')

      searchInput.value = ''
      const usersList = document.querySelector('.payee_box-accounts_users')
      usersList.innerHTML = ``
    }

    //choose account -> render id
    function handleChooseAccount(icon){
      const user_id = icon.querySelector('.accounts_users-item_id.text-warning').innerHTML
      
      document.querySelector('.transfer_box-form_input.user_id').value = user_id
    }

    let dataBodyFetch = {}
    //pop up transfer modal
    function handleTransfer(){
      const user_id = document.querySelector('.transfer_box-form_input.user_id').value
      const amount  = document.querySelector('.transfer_box-form_input.money_amount').value
      const message = document.querySelector('.transfer_box-form_input#transfer_msg').value
      const renderTotal = document.querySelector('.transfer-confirm_total')
      const renderMsg = document.querySelector('.transfer_box-invalid_input')
      const renderFee = document.querySelector('.transfer-confirm_total.transfer-confirm_fee')
      
      renderTotal.innerText = ''
      renderMsg.innerText = ''
      renderFee.innerText = ''

      const amount_str = amount.split(' ')[0]
      
      const str_arr = amount_str.split(',')
      let amount_int = ""

      str_arr.forEach(str => {
        amount_int += str
      })

      if(!user_id || !amount_str || !message){
        renderMsg.innerText = 'Thiếu thông tin chuyển tiền'
        
      }else{
        
        let transfer_int = parseInt(amount_int)
        let feeTransfer = Math.ceil(transfer_int*5/100)

        dataBodyFetch = {actor: localStorage.getItem('accessToken')}

        transfer_int = convertToStr(transfer_int)
        feeTransfer = convertToStr(feeTransfer)

        renderTotal.innerText = `${transfer_int} VND`
        renderFee.innerText = `${feeTransfer} VND`
        fetch('http://localhost:3000/wallet/transfer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataBodyFetch)
        })
        .then(res => res.json())
        .then(response => {
          console.log(response)
          $('#transferModal').modal('show')
        })
      }
      
    }
    
    //handle confirm transfer
    function confirmedTransfer(){

      //check xem PIN dung chua

      //fetch api
      const errMsg = document.querySelector('.transfer_box-invalid_otp')
      const PIN = document.querySelector('.transfer_input-PIN').value;

      if (!PIN) {
        errMsg.innerText = 'Thiếu thông tin mã OTP'
      }
      else {
        const isActor = document.querySelector('input[name="fee_payer"]:checked').value == 'you'
        const message = document.querySelector('#transfer_msg').value
        let money = document.querySelector('.transfer_box-form_input.money_amount').value
        money = money.split(' ')[0]
        money = money.replaceAll(',', '')
        let username = document.querySelector('.transfer_box-form_input.user_id').value
        username = username.replaceAll(
          '#', ''
          )
        const email = targetInfo[username]
        dataBodyFetch = {
          ...dataBodyFetch,
          otpCode: PIN,
          receiverEmail: email,
          money: parseInt(money),
          message,
          isActor
        }
        fetch('http://localhost:3000/wallet/transferwithpin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dataBodyFetch)
        })
        .then(res => res.json())
        .then(response => {
          if (response.code == 0) {
            console.log(response)
            let balance = response.data.accountBalance;
            balance = balance.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
  
            const toastMessage = document.querySelector('#toastMessage');
            const action = toastMessage.querySelector('#toast_message-action')
            const result = toastMessage.querySelector('#toast_message-result')
            action.innerText = 'Transfer:';
            result.innerText = `${response.message}. Ví điện tử của quý khách hiện đang có ${balance}`
            toastMessage.classList.remove('alert-danger')
            toastMessage.classList.add('alert-success')
            toastMessage.classList.add('show')
            setTimeout(function() {
              toastMessage.classList.remove('show')
            }, 10000)
            document.querySelector('.form_balance-amount.balance').textContent = balance
            $('#transferModal').modal('hide')
          }
          else {
            const toastMessage = document.querySelector('#toastMessage');
            const action = toastMessage.querySelector('#toast_message-action')
            const result = toastMessage.querySelector('#toast_message-result')
            action.innerText = 'Transfer:';
            result.innerText = `${response.message}`
            toastMessage.classList.remove('alert-success')
            toastMessage.classList.add('alert-danger')
            toastMessage.classList.add('show')
            setTimeout(function() {
              toastMessage.classList.remove('show')
            }, 10000)
            $('#transferModal').modal('hide')
          }
        })
      }
    }
}



// Mua thẻ
const buy_cards = document.querySelector('.buy_cards-content')

if(buy_cards){

  let cardsSameType = []
  const countSpan = document.querySelector('.header_box-count_number')
  let validType = ''
  const purchaseBtn = document.querySelector('.buy_cards-btn')

  //
  function turnOnSelection(tag){
    const type = tag.getAttribute('card_type')
    const value = tag.innerText
    const updateQuantity = tag.querySelector('.item_list-item_quantity')

    if(cardsSameType.length === 5) return

    if(cardsSameType.length === 0){
      validType = type
      tag.setAttribute('class', 'item_list-item selected')
      cardsSameType.push({type, value: convertMoneyAmount(value)})
      countSpan.innerText = cardsSameType.length
      updateQuantity.innerText = 1

    }else{
      // const selected = tag.getAttribute('class').split(' ')[1]
      // if(selected){
      //   updateQuantity.innerText = parseInt(updateQuantity.innerText) + 1
      // }
      if(type != validType) return

      tag.setAttribute('class', 'item_list-item selected')
      cardsSameType.push({type, value: convertMoneyAmount(value)})
      updateQuantity.innerText = parseInt(updateQuantity.innerText) + 1
      countSpan.innerText = cardsSameType.length
    }
    
    renderCardInfo()
  }

  //
  const cardList = document.querySelector('.bill_list-item_card_list')
  const totalSpan = document.querySelector('.bill_list-total_amount')
  const confirmAmount = document.querySelector('.bill_list-confirm_total')

  function resetSelection(){
    cardsSameType = []
    const tags = document.querySelectorAll('.item_list-item')
    const quanities = document.querySelectorAll('.item_list-item_quantity')
    const networkProvider = document.querySelector('.bill_list-item_span.phone_network')
    
    tags.forEach(tag => {
      tag.setAttribute('class', 'item_list-item')
    })

    quanities.forEach(quantity => {
      quantity.innerText = 0
    })
    
    countSpan.innerText = 0

    cardList.innerHTML = ''

    totalSpan.innerText = '0 VND'

    networkProvider.innerHTML = ''

    purchaseBtn.setAttribute('disabled', true)
  }

  //
  function renderCardInfo(){
    
    cardList.innerHTML = ''

    const phoneNetwork = document.querySelector('.bill_list-item_span.phone_network')
    const network = cardsSameType[0].type
    
    purchaseBtn.removeAttribute('disabled')
    phoneNetwork.innerText = network

    let sum = 0
    cardsSameType.forEach(card => {
      const cardItem = document.createElement('div')
      cardItem.setAttribute('class', 'bill_list-item_card')

      //const randomSerie = createRandomSerie(network)
      const renderValue = convertToStr(card.value)

      cardItem.innerHTML = `
        <p>${card.type}</p>
        <p>${renderValue} VND</p>`

      cardList.appendChild(cardItem)

      sum += card.value
    })
    
    const renderSum = convertToStr(sum)
    totalSpan.innerText = `${renderSum} VND`
    confirmAmount.innerText = `${renderSum} VND`
  }

  function createRandomSerie(network){
    let myNumber = ''
    const lastDigits = Math.floor(Math.random()*90000) + 10000

    if(network == 'Viettel'){
      myNumber = '11111' + lastDigits.toString()
    }

    if(network == 'Mobifone'){
      myNumber = '22222' + lastDigits.toString()
    }

    if(network == 'Vinaphone'){
      myNumber = '33333' + lastDigits.toString()
    }

    return myNumber
  }

  function handlePurchase(){
    const quantity = cardList.childElementCount
    const internetService = cardsSameType[0].type
    let sum = 0;
    cardsSameType.forEach(card => {
      sum += card.value
    })
    purchaseFetchBody = {
      internetService: internetService,
      quantity: quantity,
      totalCost: sum,
      actor: localStorage.getItem('accessToken')
    }
    console.log(purchaseFetchBody)
    fetch('http://localhost:3000/wallet/purchasePhoneCard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(purchaseFetchBody)
    })
    .then(res => res.json())
    .then(response => {
      $('#exampleModalCenter').modal('hide')
      if (response.code === 0) {
        const phoneCards = document.querySelector('.purchase_success-box')
        phoneCards.innerHTML = ``
        response.cards.forEach(card => {
          phoneCards.innerHTML += `<h6 class="purchase_success-box_title">${card} - ${response.internetService}</h6>`
        })
        $('#manap').modal('show')
      }
      else {
        const toastMessage = document.querySelector('#toastMessage');
        const action = toastMessage.querySelector('#toast_message-action')
        const result = toastMessage.querySelector('#toast_message-result')
        action.innerText = 'Purchase phone cards:';
        result.innerText = `${response.message}`
        toastMessage.classList.remove('alert-success')
        toastMessage.classList.add('alert-danger')
        toastMessage.classList.add('show')
        setTimeout(function() {
          toastMessage.classList.remove('show')
        }, 10000)
      }
    })
    
  }
}

///////////////DEPOSIT_WITHDRAW/////////
const dep_with = document.querySelector('.dep_with-content')
if(dep_with){
  const userBalanceUi = document.querySelector('.balance_box-amount')
  const userBalanceValue = parseInt(userBalanceUi.innerText).toLocaleString('it-IT', {style : 'currency', currency : 'VND'});;
  userBalanceUi.innerText = userBalanceValue
  function validateCashIn(cardNo, cvv, dateExp, amount){
    let errs = []
    cardNo = cardNo.toString()
    cvv = cvv.toString()

    if(!cardNo){
      errs.push({type: 1, msg: 'Missing card number info'})
    }
    if(cardNo.length !== 6 && cardNo.length > 0)
      errs.push({type: 1, msg: 'Card number must have 6 digits'})

    if(!cvv){
      errs.push({type: 2, msg: 'Missing cvv info'})
    }
    if(cvv.length !== 3 && cvv.length > 0){
      errs.push({type: 2, msg: 'CVV code must have 3 digits'})
    }

    const expDate = new Date(dateExp)
    const nowDate = Date.now()
    
    if(!dateExp)
      errs.push({type: 3, msg: 'Missing card expire date'})

    if(expDate < nowDate){
      errs.push({type: 3, msg: 'Card expired!'})
    }
    
    if(!amount)
      errs.push({type: 4, msg: 'Missing amount'})
    
    
      return errs
  }

  //api cash in here
  let cashInFetchBody = {}

  function handleCashIn(){
    //err span
    const errCardNo = document.querySelector('.cardnum_err')
    const errCvv = document.querySelector('.cvv_err')
    const errExp = document.querySelector('.expdate_err')
    const errAmount = document.querySelector('.amount_err')
    
    //reset state
    let errors = []
    errCardNo.innerText = ''
    errCvv.innerHTML = ''
    errExp.innerHTML = ''
    errAmount.innerHTML = ''

    //get input values
    const cardNo = document.querySelector('#cash_in_cardnum').value
    const cvv = document.querySelector('#cash_in_cvv').value
    const expDate = document.querySelector('#cash_in_exp').value
    const moneyAmount = document.querySelector('#cash_in_amount').value
    const intAmount = parseInt(convertMoneyAmount(moneyAmount))

    errors = validateCashIn(cardNo, cvv, expDate, moneyAmount)

    if(errors.length > 0){
      errors.forEach(err => {
        if(err.type === 1){
          errCardNo.innerText = err.msg
        }
        else if(err.type === 2){
          errCvv.innerHTML = err.msg
        }
        else if(err.type === 3)
          errExp.innerHTML = err.msg
        else
          errAmount.innerHTML = err.msg
      })
    }else{
      
      const accessToken = localStorage.getItem('accessToken')
      cashInFetchBody = {
        creditCardNumber: cardNo, 
        cvvCode: cvv,
        expirationDate: expDate,
        money: intAmount, 
        actor: accessToken
      }
      fetch('http://localhost:3000/wallet/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cashInFetchBody) 
      })
      .then(res => res.json())
      .then(response => {
        if (response.code == 0) {
          let balance = response.data.accountBalance;
          balance = balance.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});

          const toastMessage = document.querySelector('#toastMessage');
          const action = toastMessage.querySelector('#toast_message-action')
          const result = toastMessage.querySelector('#toast_message-result')
          action.innerText = 'Cash in:';
          result.innerText = `${response.message}. Ví điện tử của quý khách hiện đang có ${balance}`
          toastMessage.classList.remove('alert-danger')
          toastMessage.classList.add('alert-success')
          toastMessage.classList.add('show')
          setTimeout(function() {
            toastMessage.classList.remove('show')
          }, 10000)
          document.querySelector('.balance_box-amount').textContent = balance
        }
        else {
          const toastMessage = document.querySelector('#toastMessage');
          const action = toastMessage.querySelector('#toast_message-action')
          const result = toastMessage.querySelector('#toast_message-result')
          action.innerText = 'Cash in';
          result.innerText = `${response.message}`
          toastMessage.classList.remove('alert-success')
          toastMessage.classList.add('alert-danger')
          toastMessage.classList.add('show')
          setTimeout(function() {
            toastMessage.classList.remove('show')
          }, 10000)
        }
      })
    }
  }

  //handle cash out
  let cashOutFetchBody = {}

  function handleCashOut(){
    //err span
    const errCardNo = document.querySelector('.cardnum_err.withdraw')
    const errCvv = document.querySelector('.cvv_err.withdraw')
    const errExp = document.querySelector('.expdate_err.withdraw')
    const errAmount = document.querySelector('.amount_err.withdraw')
    const errLastValidate = document.querySelector('.last_err.withdraw')

    //reset state
    let errors = []
    errCardNo.innerText = ''
    errCvv.innerHTML = ''
    errExp.innerHTML = ''
    errAmount.innerHTML = ''
    errLastValidate.innerHTML = ''

    //get input values
    const cardNo = document.querySelector('#cash_out_cardnum').value
    const cvv = document.querySelector('#cash_out_cvv').value
    const expDate = document.querySelector('#cash_out_exp').value
    const moneyAmount = document.querySelector('#cash_out_amount').value
    const intAmount = parseInt(convertMoneyAmount(moneyAmount))
    const withdrawNo = document.querySelector('.withdraw_inform-count').innerText
    const msg = document.querySelector('#cash_out_msg').value

    errors = validateCashIn(cardNo, cvv, expDate, moneyAmount)

    if(parseInt(withdrawNo) >= 2){
      errLastValidate.innerHTML = 'Too much number of withdraws a day!'
    }
    else if(errors.length > 0){
      errors.forEach(err => {
        if(err.type === 1){
          errCardNo.innerText = err.msg
        }
        else if(err.type === 2){
          errCvv.innerHTML = err.msg
        }
        else if(err.type === 3)
          errExp.innerHTML = err.msg
        else
          errAmount.innerHTML = err.msg
      })
    }else{
      
      if(intAmount % 50000 != 0){
        errAmount.innerHTML = 'Money amount is not multiple of 50000'
      }
      
      else{
        // const renderTotal = document.querySelector('.withdraw-confirm_total')
        // const total = convertToStr(parseInt(intAmount + (intAmount*5/100)))

        // renderTotal.innerHTML = `${total} VND`
        // $('#withdrawModal').modal('show')

        cashOutFetchBody = {
          creditCardNumber: cardNo, 
          cvvCode: cvv, 
          expirationDate: expDate, 
          money: intAmount, 
          message:msg,
          actor: localStorage.getItem('accessToken')
        }
        console.log(cashOutFetchBody);
        fetch('http://localhost:3000/wallet/withdraw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cashOutFetchBody)
        })
        .then(res=> res.json())
        .then(response => {
          if (response.code == 0) {
            let balance = response.data.accountBalance;
            balance = balance.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
  
            const toastMessage = document.querySelector('#toastMessage');
            const action = toastMessage.querySelector('#toast_message-action')
            const result = toastMessage.querySelector('#toast_message-result')
            action.innerText = 'Withdraw:';
            result.innerText = `${response.message}. Ví điện tử của quý khách hiện đang có ${balance}`
            toastMessage.classList.remove('alert-danger')
            toastMessage.classList.add('alert-success')
            toastMessage.classList.add('show')
            setTimeout(function() {
              toastMessage.classList.remove('show')
            }, 10000)
            document.querySelector('.balance_box-amount').textContent = balance
            let withdrawCount = document.querySelector('.withdraw_inform-count')
            withdrawCount.textContent = parseInt(withdrawCount.textContent) + 1
          }
          else {
            const toastMessage = document.querySelector('#toastMessage');
            const action = toastMessage.querySelector('#toast_message-action')
            const result = toastMessage.querySelector('#toast_message-result')
            action.innerText = 'Withdraw';
            result.innerText = `${response.message}`
            toastMessage.classList.remove('alert-success')
            toastMessage.classList.add('alert-danger')
            toastMessage.classList.add('show')
            setTimeout(function() {
              toastMessage.classList.remove('show')
            }, 10000)
          }
        })
      }
    
    }
  }

  //api cash out here
  function handleWithdraw(){
    console.log('cash out here', cashOutFetchBody)
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}