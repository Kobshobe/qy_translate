<template>
  <div class="footer">
    <div class="footer-side">
      <div v-if="hook.coll.status !== 'edit'" style="background-color: inherit;">
        <div
          v-if="hook.user.isLogin"
          class="footer-item-text"
          @click="hook.coll.collItem.showDialog()"
        >
          {{geti18nMsg('__newCollection__')}}
        </div>
      </div>
    </div>

    <div class="footer-side">
      <PhraseTool />
      
      <div v-if="hook.coll.status === 'edit'" class="edit-tool" style="background-color: inherit;">
        <div class="footer-item-text" @click="hook.coll.deleteSelected">{{geti18nMsg('__delete__')}}</div>
        <x-dropdown>
          <div class="footer-item-text">{{geti18nMsg('__move__')}}</div>
          <template #dropdown>
            <x-dropdown-menu>
              <div v-for="(item, index) of hook.coll.collList" :key="index">
                <x-dropdown-item
                  v-if="item.tid !== hook.coll.tid"
                  @click="hook.coll.moveToColl(item.tid)"
                  >{{ item.name }}</x-dropdown-item
                >
              </div>
            </x-dropdown-menu>
          </template>
        </x-dropdown>
      </div>

      <div class="coll-manage-btn">
        <div
          v-if="hook.coll.status !== 'edit'"
          @click="hook.coll.setStatus('edit')"
          class="footer-item-text"
        >
          {{geti18nMsg('__manage__')}}
        </div>
        <div
          v-else
          @click="hook.coll.setStatus('none')"
          class="footer-item-text"
          style="color: #4c8bf5"
        >
          {{geti18nMsg('__reduce__')}}
        </div>
      </div>
    </div>
    <x-dialog v-model="hook.coll.collItem.isShowDialog" width="400px"
    :title="hook.coll.collItem.collTid ? geti18nMsg('__rename__') : geti18nMsg('__newCollection__')">
      <x-input v-model="hook.coll.collItem.collName" :maxlength="20"></x-input>
      <div class="coll-dialog-btn">
        <x-button type="primary" @click="hook.coll.collItem.createOrRename"
          >{{geti18nMsg('__confirm__')}}</x-button
        >
      </div>
    </x-dialog>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from "vue";
import { IOptionBaseHook } from "@/interface/options";
import PhraseTool from '@/options/components/PhraseTool.vue'
import {geti18nMsg} from '@/utils/share'

const hook = inject("baseHook") as IOptionBaseHook;
const isCreateColl = ref(false);
</script>


<style lang="scss" scoped>
.footer {
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--xx-fill-color-deep);
  height: 55px;
  width: 100%;
  padding: 0 20px 0 20px;
  font-size: 16px;
  color: #6e6d7a;
  font-weight: bold;
  flex-shrink: 0;
  .footer-side {
    background-color: inherit;
    display: flex;
    cursor: pointer;
  }
  .coll-manage-btn {
    border-left: 1px solid #888;
    background-color: inherit;
  }
  .footer-item-text {
    background-color: inherit;
    padding: 0 15px 0 15px;
  }
  .edit-tool {
    display: flex;
  }
}

.coll-dialog-btn {
  display: flex;
  justify-content: flex-end;
  padding-top: 30px;
}

::v-deep(.xx-dropdown_item_wrapper) {
  font-size: 14px;
}
</style>