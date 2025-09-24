<template>
  <div class="generic-rule">
    <el-form label-width="auto">
      <el-form-item
        v-for="field in fields"
        size="small"
        :key="field.name"
        :label="field.label"
        :required="field.required"
      >
        <!-- 文本输入 -->
        <el-input
          v-if="field.type === 'input'"
          size="small"
          v-model="modelValue[field.name]"
          :placeholder="field.placeholder"
        />

        <!-- 开关 -->
        <el-switch
          v-else-if="field.type === 'switch'"
          size="small"
          v-model="modelValue[field.name]"
        />

        <!-- 数字输入 -->
        <el-input-number
          v-else-if="field.type === 'number'"
          size="small"
          v-model="modelValue[field.name]"
          :min="field.min"
          :max="field.max"
        />

        <!-- 下拉选择 -->
        <el-select
          v-else-if="field.type === 'select'"
          size="small"
          v-model="modelValue[field.name]"
          style="width: 100%"
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <!-- 文本域 -->
        <el-input
          v-else-if="field.type === 'textarea'"
          type="textarea"
          v-model="modelValue[field.name]"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { RULE_CONFIGS } from '@/utils/ruleConfig';

export default defineComponent({
  name: 'GenericRule',
  props: {
    ruleType: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Object,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  computed: {
    fields() {
      return RULE_CONFIGS[this.ruleType].fields;
    },
  },
});
</script>

<style lang="less" scoped>
.generic-rule {
  .el-form-item {
    margin-bottom: 2px;
  }
}
</style>
