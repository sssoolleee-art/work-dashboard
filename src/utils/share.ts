export async function shareLink(title: string, description: string) {
  try {
    if (navigator.share) {
      await navigator.share({ title, text: description });
    } else {
      await navigator.clipboard?.writeText(`${title}\n${description}`);
    }
  } catch {
    // 공유 실패/취소 — 무시
  }
}

export async function shareText(text: string) {
  try {
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard?.writeText(text);
    }
  } catch {
    // 공유 실패/취소 — 무시
  }
}
