import XButton from './components/button/Button.vue'
import XSizeBox from './components/sizebox/SizeBox.vue'
import XRadio from './components/radio/Radio.vue'
import XRadioGroup from './components/radio/RadioGroup.vue'
import XMessage from './components/message/message'
import XXMessage from './components/message/Message.vue'
import XDialog from './components/dialog/Dialog.vue'
import XSelect from './components/select/Select.vue'
import XSelectOption from './components/select/SelectOption.vue'
import XSelectGroup from './components/select/SelectGroup.vue'
import XCheckbox from './components/checkbox/Checkbox.vue'
import XSwitch from './components/switch/Switch.vue'
import XInput from './components/input/Input.vue'
import XTooltip from './components/tooltip/Tooltip.vue'
import XDropdown from './components/dropdown/Dropdown.vue'
import XDropdownMenu from './components/dropdown/DropdownMenu.vue'
import XDropdownItem from './components/dropdown/DropdownItem.vue'
import XMessageBox from './components/message-box/message-box'

import appInstallOptionsHandle from './shared/app-install'

const components:any = {
    XButton,
    XSizeBox,
    XRadio,
    XRadioGroup,
    XMessage,
    XXMessage,
    XDialog,
    XSelect,
    XSelectOption,
    XSelectGroup,
    XCheckbox,
    XSwitch,
    XInput,
    XTooltip,
    XDropdown,
    XDropdownMenu,
    XDropdownItem,
    XMessageBox,
}

export {
    XMessage,
    XMessageBox
}

export default {
    install(app:any, options:any) {
        appInstallOptionsHandle(options)
        for (const comp in components) {
            app.component(comp, components[comp])
        }
    }
}