"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var queryString = require("query-string");
var fetch = require("node-fetch");

var _require = require("asyncro"),
    reduce = _require.reduce;

module.exports = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(configOptions) {
    var contentTypes, locales, entries, contentstackData;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.time("Fetch Contentstack data");
            console.log("Starting to fetch data from Contentstack");

            configOptions.cdn = configOptions.cdn ? configOptions.cdn : "https://cdn.contentstack.io/v3";

            _context.next = 5;
            return fetchContentTypes(configOptions);

          case 5:
            contentTypes = _context.sent;

            console.log("Content Types loaded");
            _context.next = 9;
            return fetchLocales(configOptions);

          case 9:
            locales = _context.sent;

            console.log("Locales loaded");
            _context.next = 13;
            return fetchEntries(locales, contentTypes, configOptions);

          case 13:
            entries = _context.sent;

            console.log("Content Entries loaded");

            contentstackData = {
              locales: locales,
              contentTypes: contentTypes,
              entries: entries
            };
            return _context.abrupt("return", {
              contentstackData: contentstackData
            });

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

var fetchLocales = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(config) {
    var url, responseKey, allLocales;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            url = "locales";
            responseKey = "locales";
            _context2.next = 4;
            return getPagedData({ url: url, config: config, responseKey: responseKey });

          case 4:
            allLocales = _context2.sent;
            return _context2.abrupt("return", allLocales);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function fetchLocales(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

var fetchContentTypes = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(config) {
    var url, responseKey, allContentTypes;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            url = "content_types";
            responseKey = "content_types";
            _context3.next = 4;
            return getPagedData({ url: url, config: config, responseKey: responseKey });

          case 4:
            allContentTypes = _context3.sent;
            return _context3.abrupt("return", allContentTypes);

          case 6:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function fetchContentTypes(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

var fetchEntries = function () {
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(locales, contentTypes, configOptions) {
    var getContentTypeEntries = function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(contentTypeUid) {
        var _this = this;

        var url, responseKey, entries;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                url = "content_types/" + contentTypeUid + "/entries";
                responseKey = "entries";
                _context6.next = 4;
                return reduce(locales, function () {
                  var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
                    var accumulator = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                    var locale = arguments[1];
                    var localeEntries;
                    return _regenerator2.default.wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            _context5.next = 2;
                            return getPagedData({
                              config: configOptions,
                              locale: locale.code,
                              query: {},
                              responseKey: responseKey,
                              url: url
                            });

                          case 2:
                            localeEntries = _context5.sent;

                            accumulator = !accumulator.length ? localeEntries : accumulator.concat(localeEntries);
                            return _context5.abrupt("return", accumulator);

                          case 5:
                          case "end":
                            return _context5.stop();
                        }
                      }
                    }, _callee5, _this);
                  }));

                  return function () {
                    return _ref7.apply(this, arguments);
                  };
                }(), []);

              case 4:
                entries = _context6.sent;
                return _context6.abrupt("return", entries);

              case 6:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      return function getContentTypeEntries(_x9) {
        return _ref6.apply(this, arguments);
      };
    }();

    var allContentTypesEntries;
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            allContentTypesEntries = [];
            _context7.next = 3;
            return reduce(contentTypes, function () {
              var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(accumulator, contentType) {
                var contentTypesEntries;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        _context4.next = 2;
                        return getContentTypeEntries(contentType.uid);

                      case 2:
                        contentTypesEntries = _context4.sent;

                        accumulator[contentType.uid] = contentTypesEntries;
                        return _context4.abrupt("return", accumulator);

                      case 5:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4, undefined);
              }));

              return function (_x7, _x8) {
                return _ref5.apply(this, arguments);
              };
            }(), {});

          case 3:
            allContentTypesEntries = _context7.sent;
            return _context7.abrupt("return", allContentTypesEntries);

          case 5:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, undefined);
  }));

  return function fetchEntries(_x4, _x5, _x6) {
    return _ref4.apply(this, arguments);
  };
}();

var fetchCsData = function () {
  var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(url, config, query) {
    var queryParams, apiUrl;
    return _regenerator2.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            query = query ? query : {};
            query.include_count = true;
            query.api_key = config.api_key;
            query.access_token = config.access_token;
            query.environment = config.environment;

            if (url.includes("locales")) query.v = Math.floor(Math.random() * 100);

            queryParams = queryString.stringify(query);
            apiUrl = config.cdn + "/" + url + "?" + queryParams;
            return _context8.abrupt("return", new _promise2.default(function (resolve, reject) {
              fetch(apiUrl).then(function (response) {
                return response.json();
              }).then(function (data) {
                resolve(data);
              }).catch(function (err) {
                console.error(err);
                reject(err);
              });
            }));

          case 9:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, undefined);
  }));

  return function fetchCsData(_x11, _x12, _x13) {
    return _ref8.apply(this, arguments);
  };
}();

var getPagedData = function () {
  var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(_ref10) {
    var url = _ref10.url,
        config = _ref10.config,
        _ref10$limit = _ref10.limit,
        limit = _ref10$limit === undefined ? 100 : _ref10$limit,
        locale = _ref10.locale,
        _ref10$query = _ref10.query,
        query = _ref10$query === undefined ? {} : _ref10$query,
        responseKey = _ref10.responseKey,
        _ref10$skip = _ref10.skip,
        skip = _ref10$skip === undefined ? 0 : _ref10$skip;
    var response;
    return _regenerator2.default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            query.skip = skip;
            query.limit = limit;
            query.locale = locale;
            if (url.includes("locales")) query.v = Math.floor(Math.random() * 100);
            _context9.next = 6;
            return fetchCsData(url, config, query);

          case 6:
            response = _context9.sent;


            if (!aggregatedResponse) {
              aggregatedResponse = response[responseKey];
            } else {
              aggregatedResponse = aggregatedResponse.concat(response[responseKey]);
            }

            if (!(skip + limit <= response.count)) {
              _context9.next = 10;
              break;
            }

            return _context9.abrupt("return", getPagedData({
              url: url,
              config: config,
              responseKey: responseKey,
              query: {},
              skip: skip + limit,
              limit: limit,
              aggregatedResponse: aggregatedResponse,
              locale: locale
            }));

          case 10:
            return _context9.abrupt("return", aggregatedResponse);

          case 11:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, undefined);
  }));

  return function getPagedData(_x14) {
    return _ref9.apply(this, arguments);
  };
}();