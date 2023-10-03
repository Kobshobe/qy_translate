import {useZIndex} from '../hook/useZIndex'

interface IAppOptions {
    zIndex?:number
}

const appInstallOptionsHandle = (options:IAppOptions) => {
    if (options.zIndex) {
        const {setZIndex} = useZIndex()
        setZIndex(options.zIndex)
    }
}

export default appInstallOptionsHandle