<template>
  <div class="footer">
    <div class="footer-side">
      <div v-if="hook.coll.status !== 'edit'">
        <div
          v-if="hook.user.isLogin"
          class="footer-item-text"
          @click="hook.coll.collItem.showDialog()"
        >
          {{geti18nMsg('__newCollection__')}}
        </div>
      </div>
      <!-- <i class="el-icon-arrow-left"></i>
      <div>{{ hook.page }}</div>
      <i class="el-icon-arrow-right"></i> -->
    </div>

    <div class="footer-side">
      <PhraseTool />
      
      <div v-if="hook.coll.status === 'edit'" class="edit-tool">
        <div class="footer-item-text" @click="hook.coll.deleteSelected">{{geti18nMsg('__delete__')}}</div>
        <el-dropdown>
          <div class="footer-item-text">{{geti18nMsg('__move__')}}</div>
          <template #dropdown>
            <el-dropdown-menu>
              <div v-for="(item, index) of hook.coll.collList" :key="index">
                <el-dropdown-item
                  v-if="item.tid !== hook.coll.tid"
                  @click="hook.coll.moveToColl(item.tid)"
                  >{{ item.name }}</el-dropdown-item
                >
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
    <el-dialog v-model="hook.coll.collItem.isShowDialog" width="400px"
    :title="hook.coll.collItem.collTid ? geti18nMsg('__rename__') : geti18nMsg('__newCollection__')">
      <el-input v-model="hook.coll.collItem.collName" maxlength="20"></el-input>
      <div class="coll-dialog-btn">
        <el-button type="primary" @click="hook.coll.collItem.createOrRename"
          >{{geti18nMsg('__confirm__')}}</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from "vue";
import { IOptionBaseHook } from "@/interface/options";
import PhraseTool from '@/options/components/PhraseTool.vue'
import {geti18nMsg} from '@/utils/share'

export default defineComponent({
  setup() {
    const hook = <IOptionBaseHook>inject("baseHook");
    const isCreateColl = ref(false);

    return {
      hook,
      isCreateColl,
      geti18nMsg
    };
  },
  components: {
    PhraseTool
  }
});
</script>


<style lang="scss" scoped>
.footer {
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ececec;
  height: 55px;
  width: 100%;
  padding: 0 20px 0 20px;
  font-size: 16px;
  color: #6e6d7a;
  font-weight: bold;
  flex-shrink: 0;
  .footer-side {
    display: flex;
    cursor: pointer;
  }
  .coll-manage-btn {
    border-left: 1px solid #888;
  }
  .footer-item-text {
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

::v-deep(.el-dropdown) {
  font-size: 16px;
  line-height: normal;
}

::v-deep(.el-dropdown-menu__item) {
  font-size: 14px;
}
</style>