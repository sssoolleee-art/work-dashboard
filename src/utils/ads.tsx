import { useEffect, useRef } from 'react';
import { TossAds, loadFullScreenAd, showFullScreenAd, IAP } from '@apps-in-toss/web-framework';

export const AD_FREE_SKU = 'ait.0000027535.6f110e23.d52457cf64.8230013839';
export const AD_FREE_KEY = 'workdashboard_ad_free';

export function isAdFree(): boolean {
  return localStorage.getItem(AD_FREE_KEY) === 'true';
}

export async function restoreAdFree(onUnlocked: () => void) {
  if (isAdFree()) { onUnlocked(); return; }
  try {
    const res = await IAP.getCompletedOrRefundedOrders();
    if (res?.orders.some(o => o.status === 'COMPLETED' && o.sku === AD_FREE_SKU)) {
      localStorage.setItem(AD_FREE_KEY, 'true');
      onUnlocked();
    }
  } catch {}
}

export function buyAdFree(onSuccess: () => void, onDone: () => void) {
  const cleanup = IAP.createOneTimePurchaseOrder({
    options: {
      sku: AD_FREE_SKU,
      processProductGrant: async () => {
        try { localStorage.setItem(AD_FREE_KEY, 'true'); onSuccess(); return true; }
        catch { return false; }
      },
    },
    onEvent: () => { cleanup(); onDone(); },
    onError: () => { cleanup(); onDone(); },
  });
}

export const AD_ID = {
  banner: 'ait.v2.live.0ab2fe0210e14960',
  interstitial: 'ait.v2.live.b3c9513886554776',
  rewarded: 'ait.v2.live.ff21ee7ba10b4cab',
};

// 노출 정책: 전면광고를 반복하지 않음 — 세션당 최대 2회, 최소 3분 간격
let interstitialShownCount = 0;
let interstitialShownAt = 0;
function allowInterstitial(): boolean {
  const now = Date.now();
  if (interstitialShownCount >= 2 || now - interstitialShownAt < 180_000) return false;
  interstitialShownCount += 1;
  interstitialShownAt = now;
  return true;
}

export function showInterstitialAd(): Promise<void> {
  if (!allowInterstitial()) return Promise.resolve();
  return new Promise((resolve) => {
    // 8초 안에 준비 안 된 광고는 나중에 도착해도 띄우지 않음 ('예상하기 어려운 시점' 방지)
    let lateGuard = false;
    const lateTimer = setTimeout(() => { lateGuard = true; }, 8000);
    if (!loadFullScreenAd.isSupported()) { resolve(); return; }
    const cleanup = loadFullScreenAd({
      options: { adGroupId: AD_ID.interstitial },
      onEvent: (event) => {
        if (event.type === 'loaded' && !lateGuard) {
          clearTimeout(lateTimer);
          showFullScreenAd({
            options: { adGroupId: AD_ID.interstitial },
            onEvent: (e) => {
              if (e.type === 'dismissed') { cleanup(); resolve(); }
            },
            onError: () => { cleanup(); resolve(); },
          });
        }
      },
      onError: () => resolve(),
    });
    setTimeout(() => { cleanup(); resolve(); }, 10000);
  });
}

export function showRewarded(): Promise<boolean> {
  return new Promise((resolve) => {
    // 8초 안에 준비 안 된 광고는 나중에 도착해도 띄우지 않음 ('예상하기 어려운 시점' 방지)
    let lateGuard = false;
    const lateTimer = setTimeout(() => { lateGuard = true; }, 8000);
    if (!loadFullScreenAd.isSupported()) { resolve(false); return; }
    let earned = false;
    const cleanup = loadFullScreenAd({
      options: { adGroupId: AD_ID.rewarded },
      onEvent: (event) => {
        if (event.type === 'loaded' && !lateGuard) {
          clearTimeout(lateTimer);
          showFullScreenAd({
            options: { adGroupId: AD_ID.rewarded },
            onEvent: (e) => {
              if (e.type === 'userEarnedReward') earned = true;
              if (e.type === 'dismissed') { cleanup(); resolve(earned); }
            },
            onError: () => { cleanup(); resolve(false); },
          });
        }
      },
      onError: () => resolve(false),
    });
    setTimeout(() => { cleanup(); resolve(false); }, 15000);
  });
}

export function BannerAd() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      const result = TossAds.attachBanner(AD_ID.banner, ref.current);
      return () => result.destroy();
    } catch {}
  }, []);
  return <div ref={ref} style={{ width: '100%', minHeight: 50 }} />;
}
