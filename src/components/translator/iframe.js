

let AudioType = undefined // from to
let origin = undefined
let id = undefined

const player = new Audio()

const b = document.getElementById('audioBtn')
b.addEventListener('click', () => {
    sendPlayMsg()
})

const playAudio = function (audioElmnt, delay) {
    setTimeout(function () {
        audioElmnt.play();
    }, delay);
}

function playAudioSequentially(audioArray) {
    let currentIndex = 0;
    const audioElement = new Audio();

    function playNextAudio() {
        if (currentIndex < audioArray.length) {
            audioElement.src = audioArray[currentIndex];
            audioElement.play();
            currentIndex++;
        } else {
            // 播放完所有音频
            console.log("已经播放完所有音频");
        }
    }

    // 监听音频结束事件
    audioElement.addEventListener('ended', playNextAudio);

    // 开始播放第一个音频
    playNextAudio();
}

window.addEventListener('message', function (event) {
    if (event.data.source === 'phrase') {
        if (event.data.action === 'init') {
            AudioType = event.data.audioType
            origin = event.origin
            id = event.data.id
        } else if (event.data.action === 'playAudio' && event.data.id === id) {
            player.pause
            player.src = event.data.src
            if (!player.src) {
                player.src = 'data:audio/mp3;base64,' + event.data.audioBase64
            }
            player.play()
            // let langList = JSON.parse(event.data.langList);
            // if (langList.length > 0) {
            //     let audioList = langList.map(e => {
            //         return e.audioSrc
            //     })
            //     playAudioSequentially(audioList);
            // }
        }
    }
});



function sendPlayMsg() {
    sendMsgToParent({
        action: 'playAudio',
        audioType: AudioType,
        id: id
    })
}

function sendMsgToParent(msg) {
    msg.sourceID = "dsfiuasguwheuirhudfkssdhfiwehri"
    window.parent.postMessage(msg, "*");
}