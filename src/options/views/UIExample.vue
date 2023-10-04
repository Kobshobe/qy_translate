<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {XMessage, XMessageBox} from '@/xxui'
import exampleUIData from '@/hook/ui-example-hook'

const exampleData = exampleUIData() as any;

const clickHandle = (e:any) => {
    console.log('clickHandle: ', e)
}

const codeLang = ref('unknown')
const codeLang2 = ref('GO')

const showMessage = () => {
    XMessage({
        type: 'warning',
        message: 'this is message content',
    })
}

const showMessageSimple = () => XMessage('show message simple')

const showMessageBox = () => {
    XMessageBox('MessageBox Content', {
        title: 'MessageBox Title',
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        callback: (e:string) => {
            XMessage(`messagebox callback get: ${e}`)
        }
    })
}

const showDialogFunc = () => {
    exampleData.showDialog = true
}

const checkGo = ref(true)
const checkJS = ref(false)
function checkboxChange() {
    XMessage({
        type: 'success',
        message: 'Checkbox change',
    })
}

function selectorSelected(v:string) {
    XMessage({
        type: 'success',
        message: `The selector value has changed: ${v}`,
    })
}

const switchVal = ref(false)
function switchChange(val:boolean) {
    XMessage({
        type: 'success',
        message: `The switch has clicked: ${val}`,
    })
}

const inputVal = ref('')

onMounted(() => {
    const targetElement = document.getElementById('messageboxId')?.scrollIntoView();
})
</script>

<template>
    <div class="ui-main">
        <h2 class="pdb30">button</h2>
        <x-button>Default</x-button>
        <x-size-box width="20px"></x-size-box>
        <x-button type="primary">Primary</x-button>
        <x-size-box width="20px"></x-size-box>
        <x-button data-type="type_danger" type="danger" @click="clickHandle">Danger</x-button>

        <h2 class="pdb30 pdt30">radio</h2>
        <x-radio v-model="codeLang" label="JS">Javascript</x-radio>
        <x-size-box width="20px"></x-size-box>
        <x-radio v-model="codeLang" label="GO">Golang</x-radio>
        <x-size-box height="20px"></x-size-box>
        <h4>radio group</h4>
        <x-radio-group v-model="codeLang2">
            <div style="padding: 15px 0;">Select Code: {{ codeLang2 }}</div>
            <x-radio label="JS">Javascript</x-radio>
            <x-size-box width="20px"></x-size-box>
            <x-radio label="GO">Golang</x-radio>
            <x-size-box width="20px"></x-size-box>
            <x-radio label="Python">Python</x-radio>
        </x-radio-group>

        <h2 class="pdb30 pdt30">Message</h2>
        <x-button @click="showMessage">Show Message</x-button>
        <x-size-box width="15px"></x-size-box>
        <x-button @click="showMessageSimple">Show Message Simple</x-button>

        <h2 id="messageboxId" class="pdb30 pdt30">MessageBox</h2>
        <x-button @click="showMessageBox">Show MessageBox</x-button>

        <h2 class="pdb30 pdt30">Dialog</h2>
        <x-dialog v-model="exampleData.showDialog" title="This title">
            <div>this dialog content</div>
            <template #footer>
                <div style="display: flex; justify-content: flex-end;">
                    <x-button @click="exampleData.showDialog = false">Close</x-button>
                    <x-size-box width="10px" />
                    <x-button type="primary" @click="exampleData.showDialog = false">Confirm</x-button>
                </div>
            </template>
        </x-dialog>
        <x-button @click="showDialogFunc">Show Dialog</x-button>

        <h2 class="pdb30 pdt30">Select</h2>
        <div class="selector-box">
            <x-select
                v-model="exampleData.selectValue"
                placeholder="Select"
                @change="selectorSelected"
            >
                <x-select-option 
                    v-for="item in exampleData.selectOptions"
                    :label="item.label"
                    :value="item.value"
                    :key="item.value"
                />
            </x-select>
        </div>
        <x-size-box width="10px" />
        <div class="selector-box selector-box-fixed">
            <x-select
                v-model="exampleData.selectGroupValue"
                placeholder="Select"
                @change="selectorSelected"
                popperPosition="fixed"
            >
                <x-select-group
                    v-for="item in exampleData.selectGroup"
                    :key="item.label"
                    :label="item.label"
                >
                    <x-select-option 
                        v-for="option in item.options"
                        :label="option.label"
                        :value="option.value"
                        :key="option.value"
                    />
                </x-select-group>
            </x-select>
        </div>

        <h2 class="pdb30 pdt30">Checkbox</h2>
        <x-checkbox v-model="checkGo" @change="checkboxChange">Golang</x-checkbox>
        <x-size-box width="20px" />
        <x-checkbox v-model="checkJS" @change="checkboxChange">Javascrip</x-checkbox>

        <h2 id="switchId" class="pdb30 pdt30">Switch</h2>
        <x-switch v-model="switchVal" @change="switchChange" />

        <h2 id="inputId" class="pdb30 pdt30">Input</h2>
        <x-input v-model="inputVal" placeholder="Please input" :maxlength="5" />

        <h2 id="tooltipId" class="pdb30 pdt30">Tooltip</h2>
        <div class="tooltip-space">
            <x-tooltip placement="top-end" content="设置的翻译源仅支持中英互译。语种不支持已切换到其它翻译源">
                <x-button>show tooltip</x-button>
            </x-tooltip>
        </div>

        <h2 id="dropdownId" class="pdb30 pdt30">Dropdown</h2>
        <div class="tooltip-space">
            <x-dropdown placement="top">
                <x-button>show dropdown</x-button>
                <template #dropdown>
                    <x-dropdown-menu>
                        <x-dropdown-item>Item A</x-dropdown-item>
                        <x-dropdown-item>Item B</x-dropdown-item>
                    </x-dropdown-menu>
                </template>
            </x-dropdown>
        </div>

        <x-size-box height="550px" />
    </div>
</template>

<style lang="scss" scoped>
.body-absoulte {
    position: absolute;
    background-color: red;
    height: 80px;
    width: 100px;
    top: 70px;
}
.ui-main {
    box-sizing: border-box;
    padding: 30px 20px 20px 20px;
    width: 100%;
}
.pdb30 {
    padding-bottom: 30px;
}

.pdt30 {
    padding-top: 30px;
}

.selector-box {
    display: inline-block;
    width: 180px;
}
.selector-box-fixed {
    position: fixed;

    // bottom: 70px;

    // top: 80px;

    top: 80px;
    right: 50px;

    // top: 80px;
    // right: 50px;

    // top: 290px;
    // left: 150px;
}
.tooltip-space {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
}
.dropdown-content {
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    width: 200px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 10px;
}
</style>