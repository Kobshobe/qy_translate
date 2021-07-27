import { newMarkManager, getMarkHtml } from '../utils/mark'
import {IMarkInfo} from '@/interface/trans'

let marksList = [[3, 5], [10, 14], [18, 22]]
let mark = [4, 7]
let markInfo: IMarkInfo;

test('mark test newMarkInfo', () => {
    markInfo = newMarkManager(mark, marksList)
    expect(markInfo.newMarksList).toMatchObject([[3, 7], [10, 14], [18, 22]])
    expect(markInfo.newMarksList).not.toEqual([[3, 7], [10, 14], [18, 22], [0, 0]])
    expect(false).toBe(markInfo.canReduce)

    mark = [5, 7]
    markInfo = newMarkManager(mark, marksList)
    expect(markInfo.newMarksList).toEqual([[3, 7], [10, 14], [18, 22]])
    expect(false).toBe(markInfo.canReduce)

    mark = [5, 10]
    markInfo = newMarkManager(mark, marksList)
    expect(markInfo.newMarksList).toEqual([[3, 14], [18, 22]])
    expect(false).toBe(markInfo.canReduce)

    mark = [4, 12]
    markInfo = newMarkManager(mark, marksList)
    expect(markInfo.newMarksList).toEqual([[3, 14], [18, 22]])
    expect(false).toBe(markInfo.canReduce)

    mark = [8, 15]
    markInfo = newMarkManager(mark, marksList)
    expect(markInfo.newMarksList).toEqual([[3, 5], [8, 15], [18, 22]])
    expect(false).toBe(markInfo.canReduce)

    mark = [3, 22]
    markInfo = newMarkManager(mark, marksList)
    expect(markInfo.newMarksList).toEqual([[3, 22]])
    expect(false).toBe(markInfo.canReduce)
})

test('mark test canReduce', () => {
    mark = [3, 5]
    markInfo = newMarkManager(mark, marksList)
    expect(markInfo.canReduce).toBe(true)
    expect(markInfo.newMarksList).toEqual([[10, 14], [18, 22]])

    mark = [10, 14]
    markInfo = newMarkManager(mark, marksList)
    expect(markInfo.canReduce).toBe(true)
    expect(markInfo.newMarksList).toEqual([[3, 5], [18, 22]])

    mark = [11, 13]
    markInfo = newMarkManager(mark, marksList)
    expect(markInfo.canReduce).toBe(true)
    expect(markInfo.newMarksList).toEqual([[3, 5], [10, 11], [13, 14], [18, 22]])
})

test('mark test single and empty', () => {
    mark = [3, 5]
    marksList = []
    markInfo = newMarkManager(mark, marksList)
    expect(markInfo.canReduce).toBe(false)
    expect(markInfo.newMarksList).toEqual([[3, 5]])

    mark = [3, 5]
    marksList = [[8, 9]]
    markInfo = newMarkManager(mark, marksList)
    expect(markInfo.canReduce).toBe(false)
    expect(markInfo.newMarksList).toEqual([[3, 5], [8, 9]])

    mark = [3, 9]
    marksList = [[3, 9]]
    markInfo = newMarkManager(mark, marksList)
    expect(markInfo.canReduce).toBe(true)
    expect(markInfo.newMarksList).toEqual([])

    mark = [4, 8]
    marksList = [[3, 9]]
    markInfo = newMarkManager(mark, marksList)
    expect(markInfo.canReduce).toBe(true)
    expect(markInfo.newMarksList).toEqual([[3, 4], [8, 9]])

    mark = [3, 5]
    marksList = [[3, 9]]
    markInfo = newMarkManager(mark, marksList)
    expect(markInfo.canReduce).toBe(true)
    expect(markInfo.newMarksList).toEqual([[5, 9]])
})

test('generate markHtml test', () => {
    let markHtml = ''
    let text = `apple pen is attractive`
    const markTabStar = `<span class="mark-text-wsrfhedsoufheqiwrhew">`
    const markTabEnd = `</span>`

    marksList = [[0, 5]]
    markHtml = getMarkHtml(marksList, text)
    expect(markHtml).toBe(`${markTabStar}apple${markTabEnd} pen is attractive`)

    marksList = [[6, 9]]
    markHtml = getMarkHtml(marksList, text)
    expect(markHtml).toBe(`apple ${markTabStar}pen${markTabEnd} is attractive`)

    marksList = [[10, 23]]
    markHtml = getMarkHtml(marksList, text)
    expect(markHtml).toBe(`apple pen ${markTabStar}is attractive${markTabEnd}`)

    marksList = [[0, 5]]
    markHtml = getMarkHtml(marksList, text)
    expect(markHtml).toBe(`${markTabStar}apple${markTabEnd} pen is attractive`)
    marksList = newMarkManager([10, 23], marksList).newMarksList
    markHtml = getMarkHtml(marksList, text)
    expect(markHtml).toBe(`${markTabStar}apple${markTabEnd} pen ${markTabStar}is attractive${markTabEnd}`)

    marksList = [[0, 23]]
    markHtml = getMarkHtml(marksList, text)
    expect(markHtml).toBe(`${markTabStar}apple pen is attractive${markTabEnd}`)
    // 取消标记
    marksList = newMarkManager([6, 9], marksList).newMarksList
    markHtml = getMarkHtml(marksList, text)
    expect(markHtml).toBe(`${markTabStar}apple ${markTabEnd}pen${markTabStar} is attractive${markTabEnd}`)
    expect(marksList).toEqual([[0,6],[9, 23]])
})
