<template>
    <div class="btn-box-wsrfhedsoufheqiwrhew" @click="collectHandler">
        <SvgIcon v-if="!isCollected" type="icon-shoucanganniu-hei" size=15 />
        <SvgIcon v-else type="icon-shoucang1" size=16 />
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import SvgIcon from '../base/SvgIcon.vue'

export default defineComponent({
    setup(props, context) {
        const collectHandler = () => {
            if(props.isCollected === false) {
                context.emit("collect")
            } else {
                context.emit("reduceCollect")
            }
        }
        return {collectHandler}
    },
    props: {
        isCollected: {
            default: false,
            type: Boolean
        }
    },
    components: {
        SvgIcon
    }
})
</script>


<style scoped lang="scss">
    .btn-box-wsrfhedsoufheqiwrhew {
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        // border-radius: 12px;
    }
</style>