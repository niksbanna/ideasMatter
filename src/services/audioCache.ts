// Audio caching service for storing and retrieving generated audio
interface CachedAudio {
  blob: Blob;
  timestamp: number;
  proposalId: string;
  textHash: string;
}

class AudioCacheService {
  private cache = new Map<string, CachedAudio>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached audio files

  // Generate a hash for the text content to use as cache key
  private generateTextHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Generate cache key from proposal ID and text content
  private generateCacheKey(proposalId: string, textContent: string): string {
    const textHash = this.generateTextHash(textContent);
    return `${proposalId}_${textHash}`;
  }

  // Check if cached audio exists and is still valid
  public getCachedAudio(proposalId: string, textContent: string): Blob | null {
    const cacheKey = this.generateCacheKey(proposalId, textContent);
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      return null;
    }

    // Check if cache is expired
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(cacheKey);
      return null;
    }

    console.log('Audio cache hit for proposal:', proposalId);
    return cached.blob;
  }

  // Store audio in cache
  public setCachedAudio(proposalId: string, textContent: string, audioBlob: Blob): void {
    const cacheKey = this.generateCacheKey(proposalId, textContent);
    const textHash = this.generateTextHash(textContent);

    // If cache is at max size, remove oldest entry
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.removeOldestEntry();
    }

    const cachedAudio: CachedAudio = {
      blob: audioBlob,
      timestamp: Date.now(),
      proposalId,
      textHash
    };

    this.cache.set(cacheKey, cachedAudio);
    console.log('Audio cached for proposal:', proposalId);
  }

  // Remove oldest cache entry
  private removeOldestEntry(): void {
    let oldestKey = '';
    let oldestTimestamp = Date.now();

    for (const [key, cached] of this.cache.entries()) {
      if (cached.timestamp < oldestTimestamp) {
        oldestTimestamp = cached.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log('Removed oldest audio cache entry');
    }
  }

  // Clear expired cache entries
  public clearExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.CACHE_DURATION) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
    });

    if (expiredKeys.length > 0) {
      console.log(`Cleared ${expiredKeys.length} expired audio cache entries`);
    }
  }

  // Clear all cache
  public clearAllCache(): void {
    this.cache.clear();
    console.log('Cleared all audio cache');
  }

  // Get cache statistics
  public getCacheStats(): { size: number; maxSize: number; entries: Array<{ proposalId: string; timestamp: number; age: string }> } {
    const entries = Array.from(this.cache.values()).map(cached => ({
      proposalId: cached.proposalId,
      timestamp: cached.timestamp,
      age: this.formatAge(Date.now() - cached.timestamp)
    }));

    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      entries
    };
  }

  // Format age in human-readable format
  private formatAge(ageMs: number): string {
    const minutes = Math.floor(ageMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  }

  // Check if audio exists in cache (without returning it)
  public hasCache(proposalId: string, textContent: string): boolean {
    const cacheKey = this.generateCacheKey(proposalId, textContent);
    const cached = this.cache.get(cacheKey);
    
    if (!cached) return false;
    
    // Check if cache is expired
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(cacheKey);
      return false;
    }
    
    return true;
  }
}

// Export singleton instance
export const audioCache = new AudioCacheService();

// Initialize cache cleanup on app start
if (typeof window !== 'undefined') {
  // Clear expired cache on page load
  audioCache.clearExpiredCache();
  
  // Set up periodic cleanup every 30 minutes
  setInterval(() => {
    audioCache.clearExpiredCache();
  }, 30 * 60 * 1000);
}