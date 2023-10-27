'use strict';

class FetchEntries {
  async fetchSyncData() { }
}

class FetchDefaultEntries extends FetchEntries {
  async fetchSyncData(configOptions, cache, fn) {
    const typePrefix = configOptions.type_prefix || 'Contentstack';

    let syncData = {};
    try {
      if (configOptions.expediteBuild) {
        const entryTokenKey = `${typePrefix.toLowerCase()}-sync-token-entry-${configOptions.api_key}`;
        const assetTokenKey = `${typePrefix.toLowerCase()}-sync-token-asset-${configOptions.api_key}`;
        const [syncEntryToken, syncAssetToken] = await Promise.all([cache.get(entryTokenKey), cache.get(assetTokenKey)])

        
        const syncEntryParams = syncEntryToken
          ? { sync_token: syncEntryToken }
          : { init: true, limit: configOptions.limit > 100 ? 50 : configOptions.limit };
        const syncAssetParams = syncAssetToken
          ? { sync_token: syncAssetToken }
          : { init: true, limit: configOptions.limit > 100 ? 50 : configOptions.limit };

        syncEntryParams.type = 'entry_published,entry_unpublished,entry_deleted';
        syncAssetParams.type = 'asset_published,asset_unpublished,asset_deleted';
        const [syncEntryData, syncAssetData] = await Promise.all([fn.apply(null, [syncEntryParams, configOptions]), fn.apply(null, [syncAssetParams, configOptions])]);
        const data = syncEntryData.data.concat(syncAssetData.data);
        syncData.data = data;
        await Promise.all([cache.set(entryTokenKey, syncEntryData.sync_token), cache.set(assetTokenKey, syncAssetData.sync_token)]);
      } else {
        const tokenKey = `${typePrefix.toLowerCase()}-sync-token-${configOptions.api_key}`;
        const syncToken = await cache.get(tokenKey);
        const syncParams = syncToken
          ? { sync_token: syncToken }
          : { init: true, limit: configOptions.limit > 100 ? 50 : configOptions.limit };

        syncData = await fn.apply(null, [syncParams, configOptions]);
        // Caching token for the next sync
        await cache.set(tokenKey, syncData.sync_token);
      }
    } catch (error) {
      throw error;
    }
    return syncData;
  }
}

class FetchSpecifiedContentTypesEntries extends FetchEntries {
  async fetchSyncData(configOptions, cache, fn) {
    try {
      const [syncEntryData, syncAssetData] = await Promise.all([
        this.fetchEntries(configOptions, cache, fn),
        this.fetchAssets(configOptions, cache, fn)
      ]);

      const syncData = {};
      syncData.data = syncEntryData.data.concat(syncAssetData.data);
      return syncData;
    } catch (error) {
      throw error;
    }
  }

  async fetchEntries(configOptions, cache, fn) {
    try {
      let syncData = {};
      const typePrefix = configOptions.type_prefix || 'Contentstack';
      const contentTypes = await cache.get(typePrefix);

      for (let i = 0; i < contentTypes.length; i++) {
        const contentType = contentTypes[i].uid;
        const tokenKey = `${typePrefix.toLowerCase()}-sync-token-${contentType}-${configOptions.api_key}`;

        const syncToken = await cache.get(tokenKey);
        const syncParams = syncToken ? { sync_token: syncToken } : { init: true };
        syncParams.content_type_uid = contentType;
        const _syncData = await fn.apply(null, [syncParams, configOptions]);
        syncData.data = syncData.data || [];
        syncData.data = syncData.data.concat(_syncData.data);
        // Caching token for the next sync.
        await cache.set(tokenKey, _syncData.sync_token);
      }
      return syncData;
    } catch (error) {
      throw error;
    }
  }

  async fetchAssets(configOptions, cache, fn) {
    try {
      const fetchAssetService = new FetchAssets();
      const syncData = await fetchAssetService.fetchAssets(configOptions, cache, fn);
      return syncData;
    } catch (error) {
      throw error;
    }
  }
}

class FetchSpecifiedLocalesEntries extends FetchEntries {
  async fetchSyncData(configOptions, cache, fn) {
    const [syncEntryData, syncAssetData] = await Promise.all([
      this.fetchEntries(configOptions, cache, fn),
      this.fetchAssets(configOptions, cache, fn)
    ]);

    const syncData = {};
    syncData.data = syncEntryData.data.concat(syncAssetData.data);
    return syncData;
  }

  async fetchEntries(configOptions, cache, fn) {
    try {
      let syncData = {};
      const typePrefix = configOptions.type_prefix || 'Contentstack';
      const locales = configOptions.locales;

      for (let i = 0; i < locales.length; i++) {
        const locale = locales[i];
        const tokenKey = `${typePrefix.toLowerCase()}-sync-token-${locale}-${configOptions.api_key}`;

        const syncToken = await cache.get(tokenKey);
        const syncParams = syncToken ? { sync_token: syncToken } : { init: true };
        syncParams.locale = locale;
        const _syncData = await fn.apply(null, [syncParams, configOptions]);
        syncData.data = syncData.data || [];
        syncData.data = syncData.data.concat(_syncData.data);
        // Caching token for next sync
        await cache.set(tokenKey, _syncData.sync_token);
      }
      return syncData;
    } catch (error) {
      throw error;
    }
  }

  async fetchAssets(configOptions, cache, fn) {
    try {
      const fetchAssetService = new FetchAssets();
      const syncData = await fetchAssetService.fetchAssets(configOptions, cache, fn);
      return syncData;
    } catch (error) {
      throw error;
    }
  }
}

class FetchSpecifiedLocalesAndContentTypesEntries extends FetchEntries {
  async fetchSyncData(configOptions, cache, fn) {
    const [syncEntryData, syncAssetData] = await Promise.all([
      this.fetchEntries(configOptions, cache, fn),
      this.fetchAssets(configOptions, cache, fn)
    ]);

    const syncData = {};
    syncData.data = syncEntryData.data.concat(syncAssetData.data);
    return syncData;
  }

  async fetchEntries(configOptions, cache, fn) {
    try {
      let syncData = {};
      const typePrefix = configOptions.type_prefix || 'Contentstack';
      const contentTypes = await cache.get(typePrefix);
      const locales = configOptions.locales;
  
      for (let i = 0; i < contentTypes.length; i++) {
        const contentType = contentTypes[i].uid;
        for (let j = 0; j < locales.length; j++) {
          const locale = locales[j];
          const tokenKey = `${typePrefix.toLowerCase()}-sync-token-${contentType}-${locale}-${configOptions.api_key}`;

          const syncToken = await cache.get(tokenKey);
          const syncParams = syncToken ? { sync_token: syncToken } : { init: true };
          syncParams.content_type_uid = contentType;
          syncParams.locale = locale;
          const _syncData = await fn.apply(null, [syncParams, configOptions]);
          syncData.data = syncData.data || [];
          syncData.data = syncData.data.concat(_syncData.data);
          // Caching token for next sync
          await cache.set(tokenKey, _syncData.sync_token);
        }
      }
      return syncData;
    } catch (error) {
      throw error;
    }
  }

  async fetchAssets(configOptions, cache, fn) {
    try {
      const fetchAssetService = new FetchAssets();
      const syncData = await fetchAssetService.fetchAssets(configOptions, cache, fn);
      return syncData;
    } catch (error) {
      throw error;
    }
  }
}

class FetchAssets {
  async fetchAssets(configOptions, cache, fn) {
    const typePrefix = configOptions.type_prefix || 'Contentstack';
    try {
      let syncData = {};
      const assetTokenKey = `${typePrefix.toLowerCase()}-sync-token-asset-${configOptions.api_key}`;
      const syncAssetToken = await cache.get(assetTokenKey);
      const syncAssetParams = syncAssetToken ? { sync_token: syncAssetToken } : { init: true };
      syncAssetParams.type = 'asset_published,asset_unpublished,asset_deleted';
      const syncAssetData = await fn.apply(null, [syncAssetParams, configOptions]);
      syncData.data = syncAssetData.data;
      await cache.set(assetTokenKey, syncAssetData.sync_token);
      return syncData;
    } catch (error) {
      throw error;
    }
  }
}

exports.FetchEntries = FetchEntries;
exports.FetchDefaultEntries = FetchDefaultEntries;
exports.FetchSpecifiedContentTypesEntries = FetchSpecifiedContentTypesEntries;
exports.FetchSpecifiedLocalesEntries = FetchSpecifiedLocalesEntries;
exports.FetchSpecifiedLocalesAndContentTypesEntries = FetchSpecifiedLocalesAndContentTypesEntries;
