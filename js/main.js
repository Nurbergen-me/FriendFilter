choosenArr = [];

function isItChoosen(data) {
    let arr = data.response.items;
    let local = JSON.parse(localStorage.ids)
    store = Object.keys(local).length;

    for (let i = 0; i < arr.length; i++) {
        for (let k = 0; k < store; k++) {
            if (arr[i] && arr[i].id == local[k]) {
                choosenArr[choosenArr.length] = arr[i];
                delete arr[i];
            }
        }
    }
}

function search(inp, list) {
    inp.addEventListener('keydown', (e) => {
        let count = 0;
        pressed = e.key;

        if (e.keyCode == 8) {
            pressed = '';
        }
        let letterIn = inp.value.split('');
        letterIn[letterIn.length] = pressed;
        let inputLen = letterIn.length;
        if (!pressed) {
            inputLen = inputLen - 2;
        }


        for (elem of list.childNodes) {
            if (elem.value) {
                elem.style.display = 'block';
                let lettersName = elem.getAttribute('data-name').toLowerCase().split('');
                let lettersSur = elem.getAttribute('data-surname').toLowerCase().split('');

                function rec(count) {
                    if (inputLen > 0 && lettersName[count] != letterIn[count] && lettersSur[count] != letterIn[count]) {
                        elem.style.display = 'none';
                    }
                    count++;
                    if (count < inputLen) {
                        rec(count)
                    }
                }
                rec(count)

            }
        }
    });
}

search(searchFirst, myFriends);
search(searchSecond, choosenFriends);


new Promise(function (resolve) {
    if (document.readyState == 'complete') {
        resolve();
    } else {
        window.onload = resolve();
    }
}).then(function () {
    new Promise(function (resolve, reject) {
        VK.init({
            apiId: 7311080
        });
        VK.Auth.login(function (r) {
            if (r.session) {
                console.log('всё ок!');
                resolve()
            } else {
                reject(new Error('Не удалось авторизоваться'));
            }
        }, 2 | 4);
    })
}).then(function () {
    new Promise(function (resolve, reject) {
        VK.Api.call('users.get', {
            'v': '5.73',
            'name_case': 'gen'
        }, function (r) {
            if (r.error) {
                reject(new Error(r.error.error_msg))
            } else {
                resolve();
                headerInfo.innerHTML = `Друзья ${r.response[0].last_name} ${r.response[0].first_name}`;
            }
        })
    })
}).then(function () {
    new Promise(function (resolve, reject) {
        VK.api('friends.get', {
            'v': '5.8',
            'fields': 'photo_100, bdate'
        }, function (r) {

            isItChoosen(r);

            if (r.error) {
                reject(new Error(r.error.error_msg))
            } else {
                let source = listOfFriends.innerHTML;
                let templeteFn = Handlebars.compile(source);
                let templete = templeteFn({
                    list: r.response.items
                });

                myFriends.innerHTML = templete;
            }
            if (choosenArr) {
                let source = listOfFriends.innerHTML;
                let templeteFn = Handlebars.compile(source);
                let templete = templeteFn({
                    list: choosenArr
                });

                choosenFriends.innerHTML = templete;
            }

        })
    })
}).then(function () {
    myFriends.addEventListener('dblclick', function (e) {
        if (e.target.getAttribute('class') === 'item__plus') {
            let thisLi = e.target.closest('li');
            choosenFriends.prepend(thisLi);
        }

    })
})

choosenFriends.addEventListener('dblclick', function (e) {
    if (e.target.getAttribute('class') === 'item__plus') {
        let thisLi = e.target.closest('li');
        myFriends.prepend(thisLi);
    }
})

endSave.addEventListener('click', function () {
    savingArr = {};
    elNum = 0;
    for (elem of choosenFriends.childNodes) {
        if (elem.value) {
            savingArr[elNum] = elem.value;
            elNum++;
        }
    }
    localStorage.ids = JSON.stringify(savingArr);
    alert('Данные уже сохранены!');
    console.log(localStorage)
});


let activeElem;
let osx = 0;
let osy = 0;

mDown = (e) => {
    headLine = e.target.closest('myFriends')
    activeElem = e.target.closest('li');
    console.log(e)
    osx = e.offsetX;
    osy = e.offsetY;
}

mUp = (e) => {
    let lleft = activeElem.style.left.split('px');

    if (lleft[0] > 270) {
        choosenFriends.prepend(activeElem);
    } else if (lleft[0] > 75 || lleft[0] < 65) {
        myFriends.prepend(activeElem);
    }
    activeElem.style.top = 'auto';
    console.log(lleft);
    activeElem.style.left = 'auto';
    activeElem.style.position = 'static';
    activeElem.style.background = 'transparent';
    activeElem = null;
}

mMove = (e) => {
    if (activeElem) {
        activeElem.style.position = 'fixed';
        activeElem.style.background = 'yellow';
        activeElem.style.zIndex = '12';
        newTop = e.clientY - osy + 'px';
        newLeft = e.clientX - osx + 'px';
        activeElem.style.top = newTop;
        activeElem.style.left = newLeft;
    }
}

container__body.addEventListener('mousedown', mDown);
container__body.addEventListener('mouseup', mUp);
container__body.addEventListener('mousemove', mMove);