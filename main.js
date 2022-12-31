const Pool = require('worker-threads-pool')
const os = require("os");
const cpuCount = os.cpus().length;
const path = require("path");
const util = require("util");
const fs = require("fs");
require('dotenv').config({path: path.resolve(__dirname, './config.env')});

const readFile = (filename) => util.promisify(fs.readFile)(path.resolve(__dirname, filename), 'utf8');
const writeFile = (filename, data) => util.promisify(fs.writeFile)(path.resolve(__dirname, filename), data, 'utf-8');
const pool = new Pool({max: cpuCount})
let iterations = parseInt(process.env.ITERATIONS)
let countries = process.env.COUNTRIES.toLowerCase() + "-"

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}


async function LeftPadWithZeros(phonePref, phoneSize) {
    let str = phonePref.toString();
    while (str.length < phoneSize) {
        str = str + '0';
    }

    return parseInt(str);
}

async function fileExist(data) {
    return await fs.promises.open(path.resolve('./results/progress_' + data.country + "_" + data.phonePref.toString()), 'r', (err, data) => {
        if (err) {
            return false
        } else {
            return parseInt(readFile('./results/progress_' + data.country + "_" + data.phonePref.toString()))
        }
    })
}

async function continueCheck(data) {
    let phone_number = await LeftPadWithZeros(data.phonePref, data.phoneSize)
    let progress;

    try {
        progress = parseInt(await readFile('./results/progress_' + data.country + "_" + data.phonePref.toString()))
    } catch (error) {
        progress = 0
    }

    if (phone_number < progress) {
        phone_number = progress
    }
    return phone_number;
}


async function main(data) {
    let phone_number = await continueCheck(data)
    let max_phone;

    if (data.phonePref.toString().length > 2) {
        max_phone = await LeftPadWithZeros((data.phonePref + (10 - parseInt(data.phonePref.toString().split("")[2]))).toString(), data.phoneSize)
    } else {
        max_phone = await LeftPadWithZeros(((data.phonePref * 10) + 10).toString(), data.phoneSize)
    }
    console.log(phone_number)
    for (let i = phone_number; i < max_phone; i += iterations) {

        let payload = {
            'country': data.country,
            'countryCode': data.countryCode,
            'gsm': i,
            'iterations': iterations
        }

        pool.acquire(path.resolve(__dirname, './thread.js'), {workerData: {value: payload}}, function (err, worker) {
            if (err) throw err
            //console.log(`started worker ${i} (pool size: ${pool.size})`)
            worker.on("message", msg => {
                //console.log(msg)
            });
            worker.on('exit', (code) => {
                if (code !== 0)
                    console.log(`Worker stopped with exit code ${code}`);
            })
            worker.on('error', err => {
                console.log(err);
                // do something else here like exit your program
            });
            writeFile('./results/progress_' + data.country + "_" + data.phonePref.toString(), i + "\n")
        })

    }
}

async function countryInit() {
    countries = countries.split("-")
    let country_data = await readFile("./countries")
    country_data = JSON.parse(country_data)
    for (let i = 0; i < countries.length - 1; i++) {
        let countryCode = country_data[countries[i]].countryCode;
        let phoneSize = country_data[countries[i]].phoneSize;
        let phonePrefixes = country_data[countries[i]].phonePrefixes
        phonePrefixes = phonePrefixes.split("-")

        for (let a = 0; a < phonePrefixes.length; a++) {
            let phonePref = phonePrefixes[a]

            let data = {
                'country': countries[i],
                'countryCode': countryCode,
                'phonePref': parseInt(phonePref),
                'phoneSize': parseInt(phoneSize)
            }

            main(data)
        }
    }
}


countryInit()
