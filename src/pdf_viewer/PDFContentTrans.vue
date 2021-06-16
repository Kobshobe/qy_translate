<template>
    <ContentTrans mode="pdf" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ContentTrans from '../components/translator/ContentTrans.vue'

export default defineComponent({
    components: {
        ContentTrans
    }
})
</script>
