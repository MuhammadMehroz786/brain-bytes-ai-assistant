export function useAnalytics() {
  const track = (event: string, payload?: Record<string, any>) => {
    try {
      // lightweight console-based analytics for Sprint 1
      // In Sprint 2, replace with real provider
      // eslint-disable-next-line no-console
      console.log("analytics", { event, ...payload, ts: Date.now() });
    } catch {}
  };
  return { track };
}
