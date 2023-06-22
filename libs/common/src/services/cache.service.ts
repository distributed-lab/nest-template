import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Injectable()
export class CacheService<T = any> {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  public async getOrLoad(key: string, load: () => T | Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.cache.get<T>(key)
    if (cached !== undefined && cached !== null) {
      return cached
    }

    const loaded = await load()

    if (loaded) await this.cache.set(key, loaded, ttl)

    return loaded
  }

  public get<T = any>(key: string): Promise<T> {
    return this.cache.get<T>(key)
  }

  public async mget<T = any>(keys: string[]): Promise<T[]> {
    if (!keys.length) return []
    const response = await this.cache.store.mget(...keys)
    return response as T[]
  }

  public async set(key: string, value: T, ttl?: number): Promise<void> {
    return this.cache.set(key, value, ttl)
  }

  public async mset(values: { key: string; value: T }[], ttl?: number): Promise<void> {
    const validValues = values.filter(({ value }) => value)

    if (!validValues.length) return

    const cacheArray = validValues.reduce((arr, curr) => arr.concat([curr.key, curr.value]), [])
    await this.cache.store.mset(cacheArray, ttl)
  }
}
