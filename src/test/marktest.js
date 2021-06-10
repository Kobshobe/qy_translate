
function newMarkManager(mark, marksList) {
    let newMarks = []
    let canReduce = false

    marksList.every((range) => {
        if (range[1] < mark[0] || range[0] > mark[1]) {
            newMarks.push(range)
        } else if (range[0] === mark[0] && range[1] === mark[1]) {
            canReduce = true
            return false
        } else {
            // const newMark = []
            mark[0] = Math.min(range[0], mark[0])
            mark[1] = Math.max(range[1], mark[1])
        }
        return true
    })

    newMarks.push(mark)

    return {
        canReduce,
        newMarks
    }
}

let marksList = [[3, 5], [10, 14], [18, 22]]

let mark = [4, 7]

let markInfo = newMarkManager(mark, marksList)


mark = [10, 14]

markInfo = newMarkManager(mark, marksList)


mark = [5, 10]

markInfo = newMarkManager(mark, marksList)
