var fs = require('fs');
var readlineSync = require('readline-sync');
var Promise = require('promise');

// Declare day default
const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
const defaultDate = new Date(2020, 05, 20);

function showDefaultDay() {
    return String(`dd--mm-yyy: ${defaultDate.getDate()} - ${defaultDate.getMonth()} - ${defaultDate.getFullYear()}`);
}
// Show limit
function showLimitDayOneBook() {
    const fakeDate = new Date(2020, 05, 29);
    const diffDays = Math.round(Math.abs(((fakeDate - defaultDate) / oneDay)));
    return diffDays;
}
// // Total limit
// function totalLimit(userLogin) {
//     let data1 = getData()[2].systems;
//     let findDataUser = data1.find(x => x.userName === userLogin);
//     let x = findDataUser.books;
//     let count = 0;
//     for (let i of x) {
//         count += i.limit;
//     }
//     return count;
//     // let data = getData()[2].systems[0][userLogin].books;
//     // let count = 0;
//     // for (let i of data) {
//     //     count += i.limit;
//     // }
//     // return count;
// }

// Home page 
function welcomeSystem() {
    console.log(`Welcome to our library`);
    console.log('1. Login \n2. Register');
    let number = Number(readlineSync.question(': '));
    if (number === 1) {
        checkLogin();
    }
    if (number === 2) {
        console.log('Welcome register...');
        registerUser();
    }
}


// Get data (OK)
function getData() {
    let data = JSON.parse(fs.readFileSync('data.json', { encoding: 'utf-8' }));
    return data;
}

// Show list books (OK)
function listBooks() {
    let data = getData();
    console.log(data[0].books);
}
// Write data (OK)
function writeData(data) {
    fs.writeFileSync('data.json', JSON.stringify(data));
    console.log('Save data...');
}

// Checklogin (Ok)
function checkLogin() {
    let nameLogin = readlineSync.question('Enter name: '),
        passLogin = readlineSync.question('Enter pass: ');
    let data = getData();
    let temp = 0;
    let userDatas = data[1].users;
    for (let i of userDatas) {
        if (nameLogin === i.name && passLogin === i.pass) temp += 1;
    }
    if (temp === 1) {
        if (nameLogin === 'admin') {
            showAdmin();
        }
        else {
            console.log('Welcome ', nameLogin);
            showUser(nameLogin);
        }
    }
    else {
        console.log('Name or pass wrong! try again');
        checkLogin();
    }
}

// User login (loading 1...)
function showUser(nameLogin) {
    console.log(`1. List books \n2. Brrow book \n3. Book return \n4. Show book borrow \n5. Exit`)
    let inputNumber = Number(readlineSync.question('Enter number: '));
    console.log('inputNumber showUser', inputNumber);
    while (inputNumber) {
        if (inputNumber === 1) {
            listBooks();
            showUser(nameLogin);
        }
        if (inputNumber === 2) {
            borrowBook(nameLogin);
            showUser(nameLogin);
        }
        if (inputNumber === 3) {
            returnBook(nameLogin);
            showUser(nameLogin);
        }
        if (inputNumber === 4) {
            showBookBorrow(nameLogin);
            showUser(nameLogin);
        }
        if (inputNumber === 5) {
            console.log('Exit, have a nice day :)');
            break;
        }
        break;
    }
}

// Borrow book (OK)
function borrowBook(nameLogin) {
    let data = getData();
    let dataBooks = getData()[0].books;
    let dataSystems = getData()[2].systems;
    let dataSystemLength = dataSystems.length;
    let dataLength = data[0].books.length;
    let nameBook, codeBook, limitBook;
    let count1 = 0;
    let count2 = 0;
    console.log('Select book you want borrow');
    for (let i = 0; i < dataLength; i++) {
        console.log(`code: ${dataBooks[i].code}, name: ${dataBooks[i].name}, limit: ${dataBooks[i].limitDays} day borrow`);
    }
    let inputCode = readlineSync.question('Enter code: ').toLocaleLowerCase();
    console.log('Inputcode', inputCode);
    for (let i = 0; i < dataSystemLength; i++) {
        if (dataSystems[i].userName === nameLogin) {
            for (let o of dataSystems[i].books) {
                if (inputCode === o.code.toLocaleLowerCase()) {
                    count2++;
                    break;
                }
            }
        }
    }
    for (let i of dataBooks) {
        if (inputCode === i.code.toLocaleLowerCase() && count2 === 0) {
            nameBook = i.name;
            codeBook = i.code;
            limitBook = i.limitDays;
            count1++;
            break;
        }
    }

    if (count1 === 0) {
        console.log('That code is false or is taken. Try again');
        borrowBook(nameLogin);
    }
    if (count1 > 0) {
        for (let i = 0; i < dataSystemLength; i++) {
            if (dataSystems[i].userName === nameLogin) {
                let obj = {
                    nameBook: nameBook,
                    code: codeBook,
                    dayBorrow: showDefaultDay(),
                    limit: (limitBook < showLimitDayOneBook() ? showLimitDayOneBook() - limitBook : 0)
                }
                let x = dataSystems[i].books;
                let count = obj.limit;
                for (let o of x) {
                    count += o.limit;
                }
                data[2].systems[i].books.push(obj);
                data[2].systems[i].totalLimit = count;
                writeData(data);
                break;
            }
        }
    }
}

// Return book(OK)
function returnBook(nameLogin) {
    console.log('nameLogin now returnBook', nameLogin);
    let data = getData();
    let dataSystems = getData()[2].systems;
    let dataSystemLength = dataSystems.length;
    let findIndexCode;
    let count = 0;
    let inputCode = readlineSync.question('Enter code return borrow: ').toLocaleLowerCase();
    for (let i = 0; i < dataSystemLength; i++) {
        if (dataSystems[i].userName === nameLogin) {
            findIndexCode = dataSystems[i].books.findIndex(x => x.code.toLocaleLowerCase() === inputCode);
            if (findIndexCode === -1) {
                console.log('Code not found');
                returnBook(nameLogin);
            }
            else {
                data[2].systems[i].books.splice(findIndexCode, 1);
                writeData(data);
                let test = getData()[2].systems[i].books;
                for (let o of test) {
                    count += o.limit;
                }
                data[2].systems[i].totalLimit = count;
                writeData(data);
                console.log('Return borrow book success')
                break;
            }
        }
    }

}
// show showBookBorrow (loading 1.1 ...) 
function showBookBorrow(nameLogin) {
    let data = getData()[2].systems;
    let i = 'x';
    let count = 0;
    for (let i = 0; i < data.length; i++) {
        if (nameLogin === data[i].userName) {
            console.log(data[i].books, data[i].totalLimit);
        }
    }
}

// showAdmin
function showAdmin() {
    console.log('Welcome Admin');
    let data = getData()[2].systems;
    console.log(data);    
}
showAdmin();
// Register(Ok)
function registerUser() {
    let data = getData();
    let name = readlineSync.question('Name: '),
        pass = readlineSync.question('Pass: ');
    let temp = 0;
    let characterErrors = ['#', '$', '%', '^', '&', '*', '(', ')', '{', '}', '-', '+', '@', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let resData = data[1].users;
    for (let i of resData) {
        if (name === i.name) {
            console.log('That username is taken. Try another');
            registerUser();
        }
    }
    for (let i of characterErrors) {
        if (name[0] === i || Number(name[0]) === i) {
            temp += 1;
        }
    }
    if (temp > 0) {
        console.log('\nName not start characters: number,$,%,^,&,*,(,),{,},=,-,+')
        registerUser();
    }
    else if (temp === 0) {
        let userRegister = {
            name: name.toLocaleLowerCase(),
            pass: pass
        }
        data[1].users.push(userRegister);
        let obj = {
            userName: name.toLocaleLowerCase(),
            books: [],
            totalLimit: 0
        }
        data[2].systems.push(obj);
        writeData(data);
        console.log('Register success.');
    }
}

// Main
// function main() {
//     welcomeSystem();
// }
// main();