

let AudioType = undefined // from to
let origin = undefined
let id = undefined

const player = new Audio()

const b = document.getElementById('audioBtn')
b.addEventListener('click', () => {
    sendPlayMsg()
})

window.addEventListener('message', function (event) {
    if (event.data.source === 'phrase') {
        if (event.data.action === 'init') {
            AudioType = event.data.audioType
            origin = event.origin
            id = event.data.id
        } else if (event.data.action === 'playAudio' && event.data.id === id) {
            player.pause
            player.src = 'data:audio/mp3;base64,' + event.data.audioBase64
            player.play()
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