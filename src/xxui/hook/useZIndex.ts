import {ref} from 'vue'

const zIndex = ref(0)
export const defaultInitialZindex = 2000

export function useZIndex() {

    const nextZIndex = () => {
        zIndex.value++
        // console.log(defaultInitialZindex + zIndex.value)
        return defaultInitialZindex + zIndex.value
    }

    const setZIndex = (val:number) => {
        zIndex.value = val
    }

    return {
        nextZIndex,
        setZIndex,
    }
}

export type UseZIndexReturn = ReturnType<typeof useZIndex>