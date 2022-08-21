
const t = 'window.bdstoken = "";window.gtk = "320305.131321201";'
console.log(t)
console.log(t.match(/window.gtk = "(.*);"/))