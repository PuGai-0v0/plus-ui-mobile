<template>
  <view class="page-root" :class="themeStore.rootClass">
    <wd-navbar :title="isEdit ? '编辑条目' : '表单提交'" fixed placeholder safe-area-inset-top />
    <view class="page-body">
      <view class="card">
        <wd-form ref="formRef" :model="model" :schema="schema" error-type="toast">
          <wd-form-item prop="title" title="标题" required>
            <wd-input v-model="model.title" placeholder="请输入标题" clearable />
          </wd-form-item>
          <wd-form-item prop="category" title="分类" required>
            <view class="picker-trigger" @click="categoryVisible = true">
              <text>{{ model.category || '请选择' }}</text>
              <text class="arrow">›</text>
            </view>
          </wd-form-item>
          <wd-form-item prop="status" title="状态" required>
            <wd-radio-group v-model="model.status" direction="horizontal">
              <wd-radio value="0">正常</wd-radio>
              <wd-radio value="1">停用</wd-radio>
            </wd-radio-group>
          </wd-form-item>
          <wd-form-item prop="amount" title="金额">
            <wd-input-number
              v-model="model.amount"
              allow-null
              placeholder="请输入金额"
              :min="0"
              :max="999999"
              :step="0.01"
              :precision="2"
              input-width="120px"
            />
          </wd-form-item>
          <wd-form-item prop="planDate" title="计划日期">
            <view class="picker-trigger" @click="dateVisible = true">
              <text>{{ dateLabel || '请选择' }}</text>
              <text class="arrow">›</text>
            </view>
          </wd-form-item>
          <wd-form-item prop="urgent" title="是否加急">
            <wd-switch v-model="model.urgent" />
          </wd-form-item>
          <wd-form-item prop="tags" title="标签">
            <wd-checkbox-group v-model="model.tags" direction="horizontal">
              <wd-checkbox name="重要">重要</wd-checkbox>
              <wd-checkbox name="保密">保密</wd-checkbox>
              <wd-checkbox name="跨部门">跨部门</wd-checkbox>
            </wd-checkbox-group>
          </wd-form-item>
          <wd-form-item prop="remark" title="备注">
            <wd-textarea v-model="model.remark" placeholder="请输入备注" :maxlength="200" />
          </wd-form-item>
        </wd-form>
      </view>
      <view class="card action-card">
        <wd-button type="primary" block :loading="submitting" @click="onSubmit">
          {{ isEdit ? '保存修改' : '提交' }}
        </wd-button>
        <!-- scoped 类挂自定义组件标签在小程序端不命中（virtualHost 转发 class 但 data-v 不随入），间距包一层原生 view -->
        <view v-if="isEdit" class="mt">
          <wd-button type="danger" plain block @click="onDelete">删除该条目</wd-button>
        </view>
      </view>
    </view>
    <wd-picker
      v-model="categoryPickerValue"
      :columns="categoryColumns"
      :visible="categoryVisible"
      @confirm="onCategoryConfirm"
      @cancel="categoryVisible = false"
    />
    <wd-datetime-picker
      v-model="model.planDate"
      type="date"
      :visible="dateVisible"
      @confirm="onDateConfirm"
      @cancel="dateVisible = false"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { addItem, getItem, updateItem, removeItem, type DemoItem } from '@/api/demo';
import { formatDate, toTimeValue } from '@/utils/date';
import { usePageTheme } from '@/composables/usePageTheme';

const { themeStore } = usePageTheme();

const formRef = ref();
const submitting = ref(false);
// 雪花 ID 超 JS 安全整数，后端以字符串下发，禁止 Number() 转换否则精度丢失
const editId = ref<number | string>();
const isEdit = computed(() => !!editId.value);

const model = reactive({
  title: '',
  category: '办公',
  status: '0',
  // allow-null + 空初值：避免 0 被格式化成 "0.00" 挡在光标前，手工输入数字全被精度截断拒绝
  amount: null as number | null,
  planDate: Date.now() as number | null,
  urgent: false,
  tags: [] as string[],
  remark: '',
});

const categoryVisible = ref(false);
const categoryPickerValue = ref<(string | number)[]>([]);
const categoryColumns = [['办公', '财务', '人事', '行政']];

function onCategoryConfirm({ value }: { value: (string | number)[] }) {
  model.category = String(value[0]);
  categoryVisible.value = false;
}

const dateVisible = ref(false);
const dateLabel = ref(formatDate(Date.now()));

function onDateConfirm({ value }: { value: number }) {
  model.planDate = value;
  dateLabel.value = formatDate(value);
  dateVisible.value = false;
}

const schema = {
  validate: (m: typeof model) => {
    const issues: { property: string; message: string }[] = [];
    if (!m.title.trim()) issues.push({ property: 'title', message: '标题不能为空' });
    if (m.title.length > 100) issues.push({ property: 'title', message: '标题不能超过100个字符' });
    return issues;
  },
};

onLoad((options) => {
  const id = options?.id;
  if (!id) return;
  editId.value = id;
  getItem(id)
    .then((item) => {
      if (!item) return;
      model.title = item.title || '';
      model.category = item.category || '办公';
      model.status = item.status || '0';
      model.amount =
        item.amount === null || item.amount === undefined || item.amount === ''
          ? null
          : Number(item.amount);
      model.remark = item.remark || '';
      model.urgent = item.urgent === '1';
      model.tags = item.tags ? item.tags.split(',').filter(Boolean) : [];
      if (item.planDate) {
        model.planDate = toTimeValue(`${item.planDate}T00:00:00`);
        dateLabel.value = item.planDate;
      }
    })
    .catch(() => {
      /* request 层已统一 toast */
    });
});

async function onSubmit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  submitting.value = true;
  try {
    const payload: Partial<DemoItem> = {
      id: editId.value,
      title: model.title,
      category: model.category,
      status: model.status,
      amount: model.amount,
      remark: model.remark,
      planDate: model.planDate ? formatDate(model.planDate) : null,
      urgent: model.urgent ? '1' : '0',
      tags: model.tags.join(','),
    };
    if (isEdit.value) {
      await updateItem(payload);
    } else {
      await addItem(payload);
    }
    uni.showToast({ title: '提交成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 800);
  } finally {
    submitting.value = false;
  }
}

function onDelete() {
  uni.showModal({
    title: '提示',
    content: '确定删除该条目？',
    success: async (res) => {
      if (!res.confirm) return;
      await removeItem(editId.value!);
      uni.showToast({ title: '已删除', icon: 'success' });
      setTimeout(() => uni.navigateBack(), 800);
    },
  });
}
</script>

<style scoped>
.mt {
  margin-top: 16px;
}

/* 底部按钮组与屏幕底边留白，避开全面屏 home 指示条 */
.action-card {
  margin-bottom: 24px;
  margin-bottom: calc(24px + env(safe-area-inset-bottom));
}

.picker-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 0;
  font-size: 14px;
  color: var(--wot-text-main, #1d1f29);
}

.arrow {
  color: var(--wot-text-secondary, #999);
  font-size: 16px;
}
</style>
