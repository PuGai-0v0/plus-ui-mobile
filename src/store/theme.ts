import { defineStore } from 'pinia';
import { THEME_MODE_KEY } from '@/config';

/** 外观模式：auto 跟随系统 */
export type ThemeMode = 'auto' | 'light' | 'dark';

/** 最终解析出的实际主题 */
type ResolvedTheme = 'light' | 'dark';

export const MODE_TEXT: Record<ThemeMode, string> = {
  auto: '跟随系统',
  light: '浅色',
  dark: '深色',
};

/**
 * 原生部件色板：setTabBarStyle / setNavigationBarColor / setBackgroundColor
 * 只接受具体色值，无法消费 CSS 变量，故按深浅各维护一套。
 * 色值对齐 Wot 色板：浅色页底 coolgrey-1、深色页底 coolgrey-10、
 * 导航背景 filled-oppo（浅色白 / 深色纯黑）、深色主色 blue-5。
 */
const NATIVE_PALETTE: Record<
  ResolvedTheme,
  {
    pageBg: string;
    navBg: string;
    statusBarFront: string;
    tabBarBg: string;
    tabBarColor: string;
    tabBarSelected: string;
    tabBarBorder: 'black' | 'white';
  }
> = {
  light: {
    pageBg: '#f7f8fa',
    navBg: '#ffffff',
    statusBarFront: '#000000',
    tabBarBg: '#ffffff',
    tabBarColor: '#7a7e83',
    tabBarSelected: '#1c64fd',
    tabBarBorder: 'black',
  },
  dark: {
    pageBg: '#1d1f29',
    navBg: '#000000',
    statusBarFront: '#ffffff',
    tabBarBg: '#1d1f29',
    tabBarColor: '#a9acb8',
    tabBarSelected: '#4480ff',
    tabBarBorder: 'white',
  },
};

/** tabBar 页面路径（与 pages.json 一致），setTabBarStyle 仅在这些页面可用 */
const TAB_BAR_PAGES = ['pages/index/index', 'pages/workbench/index', 'pages/mine/index'];

/** 系统主题探测 */
function detectSystemTheme(): ResolvedTheme {
  let theme: ResolvedTheme = 'light';
  // #ifdef H5
  try {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ) {
      theme = 'dark';
    }
  } catch {
    /* 保持 light */
  }
  // #endif
  // #ifndef H5
  try {
    theme = uni.getAppBaseInfo().theme === 'dark' ? 'dark' : 'light';
  } catch {
    /* 平台不支持主题探测时保持 light */
  }
  // #endif
  return theme;
}

/** 系统主题监听 */
function registerSystemThemeListener(onChange: (theme: ResolvedTheme) => void) {
  // #ifdef H5
  try {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => onChange(e.matches ? 'dark' : 'light');
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler);
    } else {
      // 旧浏览器兼容
      mql.addListener(handler);
    }
  } catch {
    /* 忽略 */
  }
  // #endif
  // #ifndef H5
  if (typeof uni.onThemeChange === 'function') {
    uni.onThemeChange((res) => onChange(res.theme === 'dark' ? 'dark' : 'light'));
  }
  // #endif
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    /** 用户选择的外观模式，持久化到本地缓存 */
    mode: (uni.getStorageSync(THEME_MODE_KEY) || 'auto') as ThemeMode,
    /** 当前系统深浅色状态 */
    systemTheme: 'light' as ResolvedTheme,
  }),
  getters: {
    /** 实际生效的主题 */
    effectiveTheme(state): ResolvedTheme {
      return state.mode === 'auto' ? state.systemTheme : state.mode;
    },
    /** 挂在页面根节点上的类，驱动全部 --wot-* CSS 变量切换 */
    rootClass(state): string {
      const effective = state.mode === 'auto' ? state.systemTheme : state.mode;
      return effective === 'dark' ? 'wot-theme-dark' : 'wot-theme-light';
    },
    modeText(state): string {
      return MODE_TEXT[state.mode];
    },
  },
  actions: {
    /** 探测系统主题、注册监听并应用初始配色（App onLaunch 调用） */
    init() {
      this.systemTheme = detectSystemTheme();
      registerSystemThemeListener((theme) => {
        this.systemTheme = theme;
        if (this.mode === 'auto') {
          this.apply();
        }
      });
      this.apply();
    },
    /** 手动切换外观模式并持久化 */
    setMode(mode: ThemeMode) {
      if (this.mode === mode) return;
      this.mode = mode;
      uni.setStorageSync(THEME_MODE_KEY, mode);
      this.apply();
    },
    /** 同步原生部件动态配色（tabBar / 状态栏 / 窗口背景） */
    apply() {
      const palette = NATIVE_PALETTE[this.effectiveTheme];
      try {
        uni.setBackgroundColor({
          backgroundColor: palette.pageBg,
          backgroundColorTop: palette.pageBg,
          backgroundColorBottom: palette.pageBg,
        });
      } catch {
        /* 部分端不支持，忽略 */
      }
      try {
        uni.setNavigationBarColor({
          frontColor: palette.statusBarFront,
          backgroundColor: palette.navBg,
          fail: () => {},
        });
      } catch {
        /* 忽略 */
      }
      // setTabBarStyle 仅对当前 tabBar 页可用：onLaunch 阶段页面栈为空、
      // 登录页等非 tabBar 页调用会报 "not TabBar page"；且其失败走异步 fail
      // 回调，try/catch 拦不住，故先判断当前页面再调用，并以 fail 静默兜底
      const pages = getCurrentPages();
      const current = pages[pages.length - 1];
      if (current && TAB_BAR_PAGES.includes(current.route || '')) {
        uni.setTabBarStyle({
          color: palette.tabBarColor,
          selectedColor: palette.tabBarSelected,
          backgroundColor: palette.tabBarBg,
          borderStyle: palette.tabBarBorder,
          fail: () => {},
        });
      }
    },
  },
});
