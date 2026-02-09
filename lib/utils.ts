export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

export function getClickCount(): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem('videoClickCount');
  return saved ? parseInt(saved) : 0;
}

export function setClickCount(count: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('videoClickCount', count.toString());
}

export function resetClickCount(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('videoClickCount');
}

export function shouldShowOverlay(clickCount: number, isMobile: boolean): boolean {
  if (isMobile) {
    return clickCount < 2; // Show overlay for clicks 0 and 1
  } else {
    return clickCount < 1; // Show overlay for click 0 only
  }
}

export function getNextAction(clickCount: number, isMobile: boolean): 'tiktok' | 'shopee' | 'play' {
  if (isMobile) {
    if (clickCount === 0) return 'tiktok';
    if (clickCount === 1) return 'shopee';
    return 'play';
  } else {
    if (clickCount === 0) return 'tiktok';
    return 'play';
  }
}

export function getButtonText(clickCount: number, isMobile: boolean): string {
  if (isMobile) {
    if (clickCount === 0) return 'Click để xem video (1/3)';
    if (clickCount === 1) return 'Click để xem video (2/3)';
    return 'Xem video';
  } else {
    if (clickCount === 0) return 'Click để xem video (1/2)';
    return 'Xem video';
  }
}
