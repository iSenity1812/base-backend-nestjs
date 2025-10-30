import * as LRUMap from 'pixl-cache';

type LRUCacheOptions = {
  maxItems?: number;
  maxAge?: number;
  maxBytes?: number;
};

export function LRUCacheMap({
  maxItems = 10000,
  maxAge = 10,
  maxBytes = 1024 * 1024,
}: LRUCacheOptions = {}) {
  return new LRUMap({ maxItems, maxAge, maxBytes });
}
