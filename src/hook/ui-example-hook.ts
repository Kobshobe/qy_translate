import { reactive } from "vue"

export default function exampleUIData() {
    const data = reactive({
        showDialog: false,
        selectValue: 'js',
        selectOptions: [
            {
                value: 'go',
                label: 'Golang'
            },
            {
                value: 'js',
                label: 'Javascript'
            },
            {
                value: 'py',
                label: 'Python'
            },
            {
                value: 'rs',
                label: 'Rust'
            },
            {
                value: 'java',
                label: 'Java'
            },
        ],
        selectGroupValue: '',
        selectGroup: [
            {
              label: 'Popular cities',
              options: [
                {
                  value: 'Shanghai',
                  label: 'Shanghai',
                },
                {
                  value: 'Beijing',
                  label: 'Beijing',
                },
              ],
            },
            {
              label: 'City name',
              options: [
                {
                  value: 'Shanghai',
                  label: 'Shanghai',
                },
                {
                  value: 'Chengdu',
                  label: 'Chengdu',
                },
                {
                  value: 'Shenzhen',
                  label: 'Shenzhen',
                },
                {
                  value: 'Guangzhou',
                  label: 'Guangzhou',
                },
                {
                  value: 'Dalian',
                  label: 'Dalian',
                },
              ],
            },
        ]
    })

    setTimeout(() => {data.selectGroupValue = 'Shanghai'}, 200)

    return data
}