import {reactive, provide, watch, nextTick, ref, Ref, toRef, computed, onBeforeMount} from 'vue'
import { UpdateModelValue, SelectKey, EventChange } from '../../consts/constants'
import { useZIndex } from '@/xxui/hook/useZIndex'

export const selectProps = {
    modelValue: {
        type: [Array, String, Number, Boolean, Object],
    },
    placeholder: {
        type: String,
    },
    popperPosition: {
        type:String,
        default: 'absolute'
    }
}

export const useSelect = (props:any, emit:any, selectorRef:Ref<HTMLElement>) => {

    const {nextZIndex} = useZIndex()

    const isShowPopper = ref<boolean>(false)
    const displayLabel = ref()
    const previousLabel = ref()
    const searchingText = ref()
    const placeholder = ref(props.placeholder)
    const valueLabel = reactive<Map<string, any>>(new Map())

    const popperStyle = ref()

    const intervalDistance = 8
    const maxHeight = props.maxHeight ?? 280
    const minHeight = 280
    
    const calcPopperGeometry = (popper:Ref<HTMLElement>) => {
        const selectorRect = selectorRef.value.getBoundingClientRect()
        const popperContentHeight = popper.value.getBoundingClientRect().height

        const currentMinHeight = minHeight > popperContentHeight ? popperContentHeight : minHeight;
        const currentMinSpace = currentMinHeight + intervalDistance*2

        const bottomSpace = window.innerHeight - selectorRect.bottom
        const topSpace = selectorRect.top

        const style:any = {}

        let height = 0;
        let right, bottom, top;
        const scrollY = props.popperPosition === 'fixed' ? 0 : window.scrollY

        if (bottomSpace >= currentMinSpace || bottomSpace >= topSpace) {
            top = selectorRect.top + scrollY + selectorRect.height
        } else {
            bottom = window.innerHeight - selectorRect.top - scrollY
        }

        if (bottom || top) {
            if (bottom) {
                height = topSpace
            } else if (top) {
                height = bottomSpace
            }
            height = height - intervalDistance * 2
            if (height > maxHeight) height = maxHeight;
            if (height > popperContentHeight) height = popperContentHeight;

            bottom && (bottom += intervalDistance);
            top && (top += intervalDistance);
        }

        !height && (height = currentMinHeight);

        style['max-height'] = `${height}px`
        bottom && (style.bottom = `${bottom}px`);
        top && (style.top = `${top}px`);
        style.left = `${selectorRect.left}px`;
        right && (style.right = `${right}px`);
        style['z-index'] = nextZIndex()
        style.width = `${selectorRect.width}px`
        style.position = props.popperPosition

        popperStyle.value = style
    }

    const setShowPopper = (isShow:boolean) => {
        isShowPopper.value = isShow
        if (!isShow) {
            displayLabel.value = previousLabel.value
            searchingText.value = null
            placeholder.value = props.placeholder
        } else {
            displayLabel.value = null
            if (previousLabel.value) {
                placeholder.value = previousLabel.value
            }
        }
    }

    const provideObj = reactive({
        setShowPopper: (isShow:boolean) => {
            isShowPopper.value = isShow
            if (!isShow) {
                displayLabel.value = previousLabel.value
                searchingText.value = null
                placeholder.value = props.placeholder
            } else {
                displayLabel.value = null
                if (previousLabel.value) {
                    placeholder.value = previousLabel.value
                }
            }
        },
        setSelect(value:any) {
            setShowPopper(false)
            emit(UpdateModelValue, value)
            emit(EventChange, value)
        },
        optionRegister(value:any, label:string) {
            valueLabel.set(value, label)
            if (props.modelValue === value) {
                nextTick(() => {
                    displayLabel.value = label
                    previousLabel.value = label
                })
            }
        },
        calcPopperGeometry,
        searchingText,
        selectedValue: toRef(props, 'modelValue'),
        isShowPopper,
        popperStyle,
        isEmpty: false,
    })

    //select
    watch(
        () => props.modelValue,
        (val) => {
            if (valueLabel.has(val)) {
                previousLabel.value = valueLabel.get(val)
                displayLabel.value = valueLabel.get(val)
            }
            searchingText.value = null
        }
    )

    //search
    watch(
        () => displayLabel.value,
        (val) => {
            if (!isShowPopper.value) return;
            if (val === previousLabel.value) {
                searchingText.value = null
                provideObj.isEmpty = false
            } else {
                searchingText.value = val
                if (!val) {
                    if (valueLabel.size) {
                        provideObj.isEmpty = false
                    } else {
                        provideObj.isEmpty = true
                    }
                    return
                }
                for (const [_, label] of valueLabel) {
                    if (label.includes(val)) {
                        provideObj.isEmpty = false
                        return
                    }
                }
                provideObj.isEmpty = true
            }
        }
    )

    provide(SelectKey, provideObj)

    return {
        displayLabel,
        setShowPopper,
        isShowPopper,
        placeholder
    }
}