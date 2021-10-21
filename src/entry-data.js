'use strict';

const { CODES } = require('./utils');

class FetchEntries {
  async fetchSyncData() { }
}

class FetchDefaultEntries extends FetchEntries {
  async fetchSyncData(configOptions, reporter, cache, fn) {
    const typePrefix = configOptions.type_prefix || 'Contentstack';

    let syncData = {};
    try {
      if (configOptions.expediteBuild) {
        const entryTokenKey = `${typePrefix.toLowerCase()}-sync-token-entry-${configOptions.api_key}`;
        const assetTokenKey = `${typePrefix.toLowerCase()}-sync-token-asset-${configOptions.api_key}`;
        const [syncEntryToken, syncAssetToken] = await Promise.all([cache.get(entryTokenKey), cache.get(assetTokenKey)])

        const syncEntryParams = syncEntryToken ? { sync_token: syncEntryToken } : { init: true };
        const syncAssetParams = syncAssetToken ? { sync_token: syncAssetToken } : { init: true };

        syncEntryParams.type = 'entry_published,entry_unpublished,entry_deleted';
        syncAssetParams.type = 'asset_published,asset_unpublished,asset_deleted';
        const [syncEntryData, syncAssetData] = await Promise.all([fn.apply(null, [syncEntryParams, configOptions]), fn.apply(null, [syncAssetParams, configOptions])]);
        const data = syncEntryData.data.concat(syncAssetData.data);
        syncData.data = data;
        await Promise.all([cache.set(entryTokenKey, syncEntryData.sync_token), cache.set(assetTokenKey, syncAssetData.sync_token)]);
      } else {
        const tokenKey = `${typePrefix.toLowerCase()}-sync-token-${configOptions.api_key}`;
        const syncToken = await cache.get(tokenKey);
        const syncParams = syncToken ? { sync_token: syncToken } : { init: true };

        syncData = await fn.apply(null, [syncParams, configOptions]);
        // Caching token for the next sync
        await cache.set(tokenKey, syncData.sync_token);
      }
    } catch (error) {
      reporter.panic({
        id: CODES.SyncError,
        context: {
          sourceMessage: `Fetching contentstack data failed [expediteBuild]. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help.`
        },
        error
      });
    }
    return syncData;
  }
}

class FetchSpecifiedContentTypesEntries extends FetchEntries {
  async fetchSyncData(configOptions, reporter, cache, fn) {
    const typePrefix = configOptions.type_prefix || 'Contentstack';
    const contentTypes = await cache.get(typePrefix);
    let syncData = {};

    try {
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
    } catch (error) {
      reporter.panic({
        id: CODES.SyncError,
        context: {
          sourceMessage: `Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help.`
        },
        error
      });
    }
    return syncData;
  }
}

class FetchSpecifiedLocalesEntries extends FetchEntries {
  async fetchSyncData(configOptions, reporter, cache, fn) {
    const typePrefix = configOptions.type_prefix || 'Contentstack';
    const locales = configOptions.locales;
    let syncData = {};

    try {
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
    } catch (error) {
      reporter.panic({
        id: CODES.SyncError,
        context: {
          sourceMessage: `Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help.`
        },
        error
      });
    }
    return syncData;
  }
}

class FetchSpecifiedLocalesAndContentTypesEntries extends FetchEntries {
  async fetchSyncData(configOptions, reporter, cache, fn) {
    const typePrefix = configOptions.type_prefix || 'Contentstack';
    const contentTypes = await cache.get(typePrefix);
    const locales = configOptions.locales;
    let syncData = {};

    try {
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
    } catch (error) {
      reporter.panic({
        id: CODES.SyncError,
        context: {
          sourceMessage: `Fetching contentstack data failed. Please check https://www.contentstack.com/docs/developers/apis/content-delivery-api/ for more help.`
        },
        error
      });
    }
    return syncData;
  }
}

exports.FetchEntries = FetchEntries;
exports.FetchDefaultEntries = FetchDefaultEntries;
exports.FetchSpecifiedContentTypesEntries = FetchSpecifiedContentTypesEntries;
exports.FetchSpecifiedLocalesEntries = FetchSpecifiedLocalesEntries;
exports.FetchSpecifiedLocalesAndContentTypesEntries = FetchSpecifiedLocalesAndContentTypesEntries;