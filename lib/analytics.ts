// GA4 事件追踪工具函数
// 使用条件：需要设置 NEXT_PUBLIC_GA_ID 环境变量

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * 追踪自定义事件
 * 如果没有配置 GA4 ID，函数静默返回，不报错
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;
  if (!GA_ID) return;

  const gtag = (window as any).gtag;
  if (typeof gtag === "function") {
    gtag("event", eventName, params);
  }
}

/**
 * 追踪 CTA 点击事件
 */
export function trackCTA(
  location: string,
  action: string,
  label?: string
) {
  trackEvent("cta_click", {
    location,
    action,
    label: label || action,
  });
}

/**
 * 追踪页面滚动深度
 */
export function trackScroll(depth: number) {
  trackEvent("scroll", { depth_percent: depth });
}

/**
 * 追踪表单提交
 */
export function trackFormSubmit(formName: string, success: boolean) {
  trackEvent("form_submit", {
    form_name: formName,
    success: success ? "true" : "false",
  });
}
