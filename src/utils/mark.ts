import {IMarkInfo} from '@/interface/trans'

export function newMarkManager(mark:number[], marksList:number[][]) :IMarkInfo {
    const newMarksList = []
    let canReduce = false

    marksList.forEach((range) => {
        if (range[1] < mark[0] || range[0] > mark[1]) {
            newMarksList.push(range)
        } else if (range[0] <= mark[0] && range[1] >= mark[1]) {
            canReduce = true
            if(range[0] < mark[0]) {
                newMarksList.push([range[0], mark[0]])
            }
            if(range[1] > mark[1]) {
                newMarksList.push([mark[1], range[1]])
            }
        } else {
            mark[0] = Math.min(range[0], mark[0])
            mark[1] = Math.max(range[1], mark[1])
        }
    })

    if(!canReduce) {
        newMarksList.push(mark)
    }
    newMarksList.sort((a, b) :number => {
        return a[0] - b[0]
    })

    return {
        canReduce,
        newMarksList
    }
}

export function getMarkHtml(marksList:number[][], text:string) :string {
    let markText = ''
    let point = 0;
    if (marksList.length > 0) {
      marksList.forEach((range: Array<number>) => {
        if (range[0] >= point) {
          markText += text.slice(point, range[0]);
          markText += `<span class="mark-text">${text.slice(
            range[0],
            range[1]
          )}</span>`;
          point = range[1];
        }
      });
    }
    markText += text.slice(point);
    return markText
}

export function getMarkHtmlFromStr(marksStr:string, text:string) {
    if(!marksStr) return text
    let marksList:number[][];
    try {
       marksList = JSON.parse(marksStr)
       return getMarkHtml(marksList, text)
    } catch {
        return text
    }
}