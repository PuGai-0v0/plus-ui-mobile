<template>
  <view class="login-page" :class="themeStore.rootClass">
    <view class="logo">
      <image class="logo-img" src="/static/logo/logo.png" mode="aspectFit" />
      <text class="title">移动端登录</text>
    </view>

    <view class="form-group">
      <wd-input v-model="form.username" prefix-icon="user" placeholder="请输入账号" clearable />
      <wd-input v-model="form.password" prefix-icon="lock" placeholder="请输入密码" show-password />
      <wd-input
        v-if="captcha.enabled"
        v-model="form.code"
        prefix-icon="safe"
        placeholder="请输入验证码"
      >
        <template #suffix>
          <image class="captcha-img" :src="captcha.img" mode="heightFix" @click="loadCaptcha" />
        </template>
      </wd-input>
    </view>

    <view class="btn-wrap">
      <wd-button
        type="primary"
        block
        size="large"
        :loading="loading"
        :disabled="loading"
        @click="handleLogin"
      >
        登 录
      </wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useUserStore } from '@/store/user';
import { useThemeStore } from '@/store/theme';
import { getCode } from '@/api/auth';

const userStore = useUserStore();
const themeStore = useThemeStore();
const loading = ref(false);
const form = reactive({ username: 'admin', password: 'admin123', code: '' });
const captcha = reactive({ enabled: false, uuid: '', img: '' });

/** 拉取验证码；后端开关关闭时 captchaEnabled=false，页面自动隐藏验证码 */
async function loadCaptcha() {
  try {
    const data = await getCode();
    captcha.enabled = data.captchaEnabled;
    captcha.uuid = data.uuid || '';
    // 后端返回裸 base64（Hutool getImageBase64），补 data URI；已带前缀则原样用
    captcha.img = data.img
      ? data.img.startsWith('data:')
        ? data.img
        : 'data:image/png;base64,' + data.img
      : '';
  } catch (e) {
    captcha.enabled = false;
  }
}

onMounted(loadCaptcha);

async function handleLogin() {
  if (!form.username || !form.password) {
    return uni.showToast({ title: '请输入账号和密码', icon: 'none' });
  }
  if (captcha.enabled && !form.code) {
    return uni.showToast({ title: '请输入验证码', icon: 'none' });
  }
  loading.value = true;
  try {
    await userStore.login(
      form.username,
      form.password,
      captcha.enabled ? form.code : undefined,
      captcha.enabled ? captcha.uuid : undefined
    );
    uni.switchTab({ url: '/pages/index/index' });
  } catch (e) {
    // request 里已弹错提示；失败后刷新验证码，避免拿旧码重试
    if (captcha.enabled) {
      form.code = '';
      await loadCaptcha();
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  padding: 60px 24px 0;
  min-height: 100vh;
  box-sizing: border-box;
  background: var(--wot-filled-bottom, #f7f8fa);
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.logo-img {
  width: 30px;
  height: 30px;
  margin-bottom: 16px;
  background: var(--wot-filled-oppo, #ffffff);
  border-radius: var(--wot-radius-extra-large, 12px);
  box-shadow: 0 4px 12px var(--wot-opac-3_08, rgba(0, 0, 0, 0.08));
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: var(--wot-text-main, #1d1f29);
}

.form-group :deep(.wd-input) {
  margin-bottom: 12px;
}

.captcha-img {
  width: 88px;
  height: 32px;
  margin-left: 8px;
}

.btn-wrap {
  margin-top: 20px;
}
</style>
