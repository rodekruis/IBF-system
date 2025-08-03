import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationLoopGuard implements CanActivate {
  private static navigationHistory: Map<string, number> = new Map();
  private static readonly MAX_NAVIGATION_COUNT = 3;
  private static readonly RESET_INTERVAL = 5000; // 5 seconds

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const url = state.url;
    const now = Date.now();
    
    // Clean up old entries
    this.cleanupOldEntries();
    
    // Get current navigation count for this URL
    const currentCount = NavigationLoopGuard.navigationHistory.get(url) || 0;
    
    if (currentCount >= NavigationLoopGuard.MAX_NAVIGATION_COUNT) {
      console.error(`🚨 Navigation loop detected for ${url}. Preventing navigation.`);
      
      // Reset the counter after blocking
      NavigationLoopGuard.navigationHistory.delete(url);
      
      // Optional: Navigate to a safe route
      // this.router.navigate(['/dashboard'], { replaceUrl: true });
      
      return false;
    }
    
    // Increment navigation count
    NavigationLoopGuard.navigationHistory.set(url, currentCount + 1);
    
    // Schedule cleanup for this specific URL
    setTimeout(() => {
      const count = NavigationLoopGuard.navigationHistory.get(url) || 0;
      if (count > 0) {
        NavigationLoopGuard.navigationHistory.set(url, Math.max(0, count - 1));
        if (count <= 1) {
          NavigationLoopGuard.navigationHistory.delete(url);
        }
      }
    }, NavigationLoopGuard.RESET_INTERVAL);
    
    return true;
  }
  
  private cleanupOldEntries(): void {
    // This is a simple cleanup - in a real implementation, you'd track timestamps
    if (NavigationLoopGuard.navigationHistory.size > 10) {
      const entries = Array.from(NavigationLoopGuard.navigationHistory.entries());
      // Keep only the most recent 5 entries
      NavigationLoopGuard.navigationHistory.clear();
      entries.slice(-5).forEach(([url, count]) => {
        NavigationLoopGuard.navigationHistory.set(url, count);
      });
    }
  }
  
  public static resetNavigationHistory(): void {
    NavigationLoopGuard.navigationHistory.clear();
    console.log('🔄 Navigation history reset');
  }
}
