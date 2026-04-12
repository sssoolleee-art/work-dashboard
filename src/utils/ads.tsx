import { useEffect, useRef } from 'react';
import { TossAds, loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';

export const AD_ID = {
  banner: 'ait.v2.live.0ab2fe0210e14960',
  interstitial: 'ait.v2.live.b3c9513886554776',
  rewarded: 'ait.v2.live.ff21ee7ba10b4cab',
};

export function showInterstitialAd(): Promise<void> {
  return new Promise((resolve) => {
    const cleanup = loadFullScreenAd({
      options: { adGroupId: AD_ID.interstitial },
      onEvent: (event) => {
        if (event.type === 'loaded') {
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
    setTimeout(() => { cleanup(); resolve(); }, 30000);
  });
}

export function showRewarded(): Promise<boolean> {
  return new Promise((resolve) => {
    const cleanup = loadFullScreenAd({
      options: { adGroupId: AD_ID.rewarded },
      onEvent: (event) => {
        if (event.type === 'loaded') {
          showFullScreenAd({
            options: { adGroupId: AD_ID.rewarded },
            onEvent: (e) => {
              if (e.type === 'userEarnedReward') { cleanup(); resolve(true); }
              else if (e.type === 'dismissed') { cleanup(); resolve(false); }
            },
            onError: () => { cleanup(); resolve(false); },
          });
        }
      },
      onError: () => resolve(false),
    });
    setTimeout(() => { cleanup(); resolve(false); }, 30000);
  });
}

export function BannerAd() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || !TossAds.attachBanner.isSupported()) return;
    const result = TossAds.attachBanner(AD_ID.banner, ref.current);
    return () => result.destroy();
  }, []);
  return <div ref={ref} style={{ width: '100%', minHeight: 50 }} />;
}
