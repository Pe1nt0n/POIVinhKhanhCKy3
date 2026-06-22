export const trackEvent = (eventName: string, poiId: string, data: any = {}) => {
  console.log(`[Analytics] ${eventName}`, { poiId, ...data });
};
