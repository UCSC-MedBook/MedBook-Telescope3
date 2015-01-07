(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var FS = Package['cfs:base-package'].FS;
var check = Package.check.check;
var Match = Package.check.Match;
var EJSON = Package.ejson.EJSON;
var HTTP = Package['cfs:http-methods'].HTTP;

/* Package-scope variables */
var baseUrl, getHeaders, getHeadersByCollection, httpDelHandler, httpGetHandler, httpPutInsertHandler, httpPutUpdateHandler, _existingMountPoints, mountUrls;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/cfs:access-point/access-point-common.js                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
baseUrl = '/cfs';                                                                                                    // 1
FS.HTTP = FS.HTTP || {};                                                                                             // 2
                                                                                                                     // 3
// Note the upload URL so that client uploader packages know what it is                                              // 4
FS.HTTP.uploadUrl = baseUrl + '/files';                                                                              // 5
                                                                                                                     // 6
/**                                                                                                                  // 7
 * @method FS.HTTP.setBaseUrl                                                                                        // 8
 * @public                                                                                                           // 9
 * @param {String} newBaseUrl - Change the base URL for the HTTP GET and DELETE endpoints.                           // 10
 * @returns {undefined}                                                                                              // 11
 */                                                                                                                  // 12
FS.HTTP.setBaseUrl = function setBaseUrl(newBaseUrl) {                                                               // 13
                                                                                                                     // 14
  // Adjust the baseUrl if necessary                                                                                 // 15
  if (newBaseUrl.slice(0, 1) !== '/') {                                                                              // 16
    newBaseUrl = '/' + newBaseUrl;                                                                                   // 17
  }                                                                                                                  // 18
  if (newBaseUrl.slice(-1) === '/') {                                                                                // 19
    newBaseUrl = newBaseUrl.slice(0, -1);                                                                            // 20
  }                                                                                                                  // 21
                                                                                                                     // 22
  // Update the base URL                                                                                             // 23
  baseUrl = newBaseUrl;                                                                                              // 24
                                                                                                                     // 25
  // Change the upload URL so that client uploader packages know what it is                                          // 26
  FS.HTTP.uploadUrl = baseUrl + '/files';                                                                            // 27
                                                                                                                     // 28
  // Remount URLs with the new baseUrl, unmounting the old, on the server only.                                      // 29
  // If existingMountPoints is empty, then we haven't run the server startup                                         // 30
  // code yet, so this new URL will be used at that point for the initial mount.                                     // 31
  if (Meteor.isServer && !FS.Utility.isEmpty(_existingMountPoints)) {                                                // 32
    mountUrls();                                                                                                     // 33
  }                                                                                                                  // 34
};                                                                                                                   // 35
                                                                                                                     // 36
/*                                                                                                                   // 37
 * FS.File extensions                                                                                                // 38
 */                                                                                                                  // 39
                                                                                                                     // 40
/**                                                                                                                  // 41
 * @method FS.File.prototype.url Construct the file url                                                              // 42
 * @public                                                                                                           // 43
 * @param {Object} [options]                                                                                         // 44
 * @param {String} [options.store] Name of the store to get from. If not defined, the first store defined in `options.stores` for the collection on the client is used.
 * @param {Boolean} [options.auth=null] Add authentication token to the URL query string? By default, a token for the current logged in user is added on the client. Set this to `false` to omit the token. Set this to a string to provide your own token. Set this to a number to specify an expiration time for the token in seconds.
 * @param {Boolean} [options.download=false] Should headers be set to force a download? Typically this means that clicking the link with this URL will download the file to the user's Downloads folder instead of displaying the file in the browser.
 * @param {Boolean} [options.brokenIsFine=false] Return the URL even if we know it's currently a broken link because the file hasn't been saved in the requested store yet.
 * @param {Boolean} [options.metadata=false] Return the URL for the file metadata access point rather than the file itself.
 * @param {String} [options.uploading=null] A URL to return while the file is being uploaded.                        // 50
 * @param {String} [options.storing=null] A URL to return while the file is being stored.                            // 51
 * @param {String} [options.filename=null] Override the filename that should appear at the end of the URL. By default it is the name of the file in the requested store.
 *                                                                                                                   // 53
 * Returns the HTTP URL for getting the file or its metadata.                                                        // 54
 */                                                                                                                  // 55
FS.File.prototype.url = function(options) {                                                                          // 56
  var self = this;                                                                                                   // 57
  options = options || {};                                                                                           // 58
  options = FS.Utility.extend({                                                                                      // 59
    store: null,                                                                                                     // 60
    auth: null,                                                                                                      // 61
    download: false,                                                                                                 // 62
    metadata: false,                                                                                                 // 63
    brokenIsFine: false,                                                                                             // 64
    uploading: null, // return this URL while uploading                                                              // 65
    storing: null, // return this URL while storing                                                                  // 66
    filename: null // override the filename that is shown to the user                                                // 67
  }, options.hash || options); // check for "hash" prop if called as helper                                          // 68
                                                                                                                     // 69
  // Primarily useful for displaying a temporary image while uploading an image                                      // 70
  if (options.uploading && !self.isUploaded()) {                                                                     // 71
    return options.uploading;                                                                                        // 72
  }                                                                                                                  // 73
                                                                                                                     // 74
  if (self.isMounted()) {                                                                                            // 75
    // See if we've stored in the requested store yet                                                                // 76
    var storeName = options.store || self.collection.primaryStore.name;                                              // 77
    if (!self.hasStored(storeName)) {                                                                                // 78
      if (options.storing) {                                                                                         // 79
        return options.storing;                                                                                      // 80
      } else if (!options.brokenIsFine) {                                                                            // 81
        // We want to return null if we know the URL will be a broken                                                // 82
        // link because then we can avoid rendering broken links, broken                                             // 83
        // images, etc.                                                                                              // 84
        return null;                                                                                                 // 85
      }                                                                                                              // 86
    }                                                                                                                // 87
                                                                                                                     // 88
    // Add filename to end of URL if we can determine one                                                            // 89
    var filename = options.filename || self.name({store: storeName});                                                // 90
    if (typeof filename === "string" && filename.length) {                                                           // 91
      filename = '/' + filename;                                                                                     // 92
    } else {                                                                                                         // 93
      filename = '';                                                                                                 // 94
    }                                                                                                                // 95
                                                                                                                     // 96
    // TODO: Could we somehow figure out if the collection requires login?                                           // 97
    var authToken = '';                                                                                              // 98
    if (Meteor.isClient && typeof Accounts !== "undefined" && typeof Accounts._storedLoginToken === "function") {    // 99
      if (options.auth !== false) {                                                                                  // 100
        // Add reactive deps on the user                                                                             // 101
        Meteor.userId();                                                                                             // 102
                                                                                                                     // 103
        var authObject = {                                                                                           // 104
          authToken: Accounts._storedLoginToken() || ''                                                              // 105
        };                                                                                                           // 106
                                                                                                                     // 107
        // If it's a number, we use that as the expiration time (in seconds)                                         // 108
        if (options.auth === +options.auth) {                                                                        // 109
          authObject.expiration = FS.HTTP.now() + options.auth * 1000;                                               // 110
        }                                                                                                            // 111
                                                                                                                     // 112
        // Set the authToken                                                                                         // 113
        var authString = JSON.stringify(authObject);                                                                 // 114
        authToken = FS.Utility.btoa(authString);                                                                     // 115
      }                                                                                                              // 116
    } else if (typeof options.auth === "string") {                                                                   // 117
      // If the user supplies auth token the user will be responsible for                                            // 118
      // updating                                                                                                    // 119
      authToken = options.auth;                                                                                      // 120
    }                                                                                                                // 121
                                                                                                                     // 122
    // Construct query string                                                                                        // 123
    var params = {};                                                                                                 // 124
    if (authToken !== '') {                                                                                          // 125
      params.token = authToken;                                                                                      // 126
    }                                                                                                                // 127
    if (options.download) {                                                                                          // 128
      params.download = true;                                                                                        // 129
    }                                                                                                                // 130
    if (options.store) {                                                                                             // 131
      // We use options.store here instead of storeName because we want to omit the queryString                      // 132
      // whenever possible, allowing users to have "clean" URLs if they want. The server will                        // 133
      // assume the first store defined on the server, which means that we are assuming that                         // 134
      // the first on the client is also the first on the server. If that's not the case, the                        // 135
      // store option should be supplied.                                                                            // 136
      params.store = options.store;                                                                                  // 137
    }                                                                                                                // 138
    var queryString = FS.Utility.encodeParams(params);                                                               // 139
    if (queryString.length) {                                                                                        // 140
      queryString = '?' + queryString;                                                                               // 141
    }                                                                                                                // 142
                                                                                                                     // 143
    // Determine which URL to use                                                                                    // 144
    var area;                                                                                                        // 145
    if (options.metadata) {                                                                                          // 146
      area = '/record';                                                                                              // 147
    } else {                                                                                                         // 148
      area = '/files';                                                                                               // 149
    }                                                                                                                // 150
                                                                                                                     // 151
    // Construct and return the http method url                                                                      // 152
    return baseUrl + area + '/' + self.collection.name + '/' + self._id + filename + queryString;                    // 153
  }                                                                                                                  // 154
                                                                                                                     // 155
};                                                                                                                   // 156
                                                                                                                     // 157
                                                                                                                     // 158
                                                                                                                     // 159
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/cfs:access-point/access-point-handlers.js                                                                //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
getHeaders = [];                                                                                                     // 1
getHeadersByCollection = {};                                                                                         // 2
                                                                                                                     // 3
/**                                                                                                                  // 4
 * @method httpDelHandler                                                                                            // 5
 * @private                                                                                                          // 6
 * @returns {any} response                                                                                           // 7
 *                                                                                                                   // 8
 * HTTP DEL request handler                                                                                          // 9
 */                                                                                                                  // 10
httpDelHandler = function httpDelHandler(ref) {                                                                      // 11
  var self = this;                                                                                                   // 12
  var opts = FS.Utility.extend({}, self.query || {}, self.params || {});                                             // 13
                                                                                                                     // 14
  // If DELETE request, validate with 'remove' allow/deny, delete the file, and return                               // 15
  FS.Utility.validateAction(ref.collection.files._validators['remove'], ref.file, self.userId);                      // 16
                                                                                                                     // 17
  /*                                                                                                                 // 18
   * From the DELETE spec:                                                                                           // 19
   * A successful response SHOULD be 200 (OK) if the response includes an                                            // 20
   * entity describing the status, 202 (Accepted) if the action has not                                              // 21
   * yet been enacted, or 204 (No Content) if the action has been enacted                                            // 22
   * but the response does not include an entity.                                                                    // 23
   */                                                                                                                // 24
  self.setStatusCode(200);                                                                                           // 25
                                                                                                                     // 26
  return {                                                                                                           // 27
    deleted: !!ref.file.remove()                                                                                     // 28
  };                                                                                                                 // 29
};                                                                                                                   // 30
                                                                                                                     // 31
/**                                                                                                                  // 32
 * @method httpGetHandler                                                                                            // 33
 * @private                                                                                                          // 34
 * @returns {any} response                                                                                           // 35
 *                                                                                                                   // 36
 * HTTP GET request handler                                                                                          // 37
 */                                                                                                                  // 38
httpGetHandler = function httpGetHandler(ref) {                                                                      // 39
  var self = this;                                                                                                   // 40
  // Once we have the file, we can test allow/deny validators                                                        // 41
  // XXX: pass on the "share" query eg. ?share=342hkjh23ggj for shared url access?                                   // 42
  FS.Utility.validateAction(ref.collection._validators['download'], ref.file, self.userId /*, self.query.shareId*/); // 43
                                                                                                                     // 44
  var storeName = ref.storeName;                                                                                     // 45
                                                                                                                     // 46
  // If no storeName was specified, use the first defined storeName                                                  // 47
  if (typeof storeName !== "string") {                                                                               // 48
    // No store handed, we default to primary store                                                                  // 49
    storeName = ref.collection.primaryStore.name;                                                                    // 50
  }                                                                                                                  // 51
                                                                                                                     // 52
  // Get the storage reference                                                                                       // 53
  var storage = ref.collection.storesLookup[storeName];                                                              // 54
                                                                                                                     // 55
  if (!storage) {                                                                                                    // 56
    throw new Meteor.Error(404, "Not Found", 'There is no store "' + storeName + '"');                               // 57
  }                                                                                                                  // 58
                                                                                                                     // 59
  // Get the file                                                                                                    // 60
  var copyInfo = ref.file.copies[storeName];                                                                         // 61
                                                                                                                     // 62
  if (!copyInfo) {                                                                                                   // 63
    throw new Meteor.Error(404, "Not Found", 'This file was not stored in the ' + storeName + ' store');             // 64
  }                                                                                                                  // 65
                                                                                                                     // 66
  if (typeof copyInfo.type === "string") {                                                                           // 67
    self.setContentType(copyInfo.type);                                                                              // 68
  } else {                                                                                                           // 69
    self.setContentType('application/octet-stream');                                                                 // 70
  }                                                                                                                  // 71
                                                                                                                     // 72
  // Content length, defaults to file size                                                                           // 73
  var contentLength = copyInfo.size;                                                                                 // 74
                                                                                                                     // 75
  // Add 'Content-Disposition' header if requested a download/attachment URL                                         // 76
  var start, end;                                                                                                    // 77
  if (typeof ref.download !== "undefined") {                                                                         // 78
    var filename = ref.filename || copyInfo.name;                                                                    // 79
    self.addHeader('Content-Disposition', 'attachment; filename="' + filename + '"');                                // 80
                                                                                                                     // 81
    // If a chunk/range was requested instead of the whole file, serve that                                          // 82
    var unit, range = self.requestHeaders.range;                                                                     // 83
    if (range) {                                                                                                     // 84
      // Parse range header                                                                                          // 85
      range = range.split('=');                                                                                      // 86
                                                                                                                     // 87
      unit = range[0];                                                                                               // 88
      if (unit !== 'bytes')                                                                                          // 89
        throw new Meteor.Error(416, "Requested Range Not Satisfiable");                                              // 90
                                                                                                                     // 91
      range = range[1];                                                                                              // 92
      // Spec allows multiple ranges, but we will serve only the first                                               // 93
      range = range.split(',')[0];                                                                                   // 94
      // Get start and end byte positions                                                                            // 95
      range = range.split('-');                                                                                      // 96
      start = range[0];                                                                                              // 97
      end = range[1] || '';                                                                                          // 98
      // Convert to numbers and adjust invalid values when possible                                                  // 99
      start = start.length ? Math.max(Number(start), 0) : 0;                                                         // 100
      end = end.length ? Math.min(Number(end), copyInfo.size - 1) : copyInfo.size - 1;                               // 101
      if (end < start)                                                                                               // 102
        throw new Meteor.Error(416, "Requested Range Not Satisfiable");                                              // 103
                                                                                                                     // 104
      self.setStatusCode(206, 'Partial Content');                                                                    // 105
      self.addHeader('Content-Range', 'bytes ' + start + '-' + end + '/' + copyInfo.size);                           // 106
      end = end + 1; //HTTP end byte is inclusive and ours are not                                                   // 107
                                                                                                                     // 108
      // Sets properly content length for range                                                                      // 109
      contentLength = end - start;                                                                                   // 110
    } else {                                                                                                         // 111
      self.setStatusCode(200);                                                                                       // 112
    }                                                                                                                // 113
  } else {                                                                                                           // 114
    self.addHeader('Content-Disposition', 'inline');                                                                 // 115
    self.setStatusCode(200);                                                                                         // 116
  }                                                                                                                  // 117
                                                                                                                     // 118
  // Add any other global custom headers and collection-specific custom headers                                      // 119
  FS.Utility.each(getHeaders.concat(getHeadersByCollection[ref.collection.name] || []), function(header) {           // 120
    self.addHeader(header[0], header[1]);                                                                            // 121
  });                                                                                                                // 122
                                                                                                                     // 123
  // Inform clients about length (or chunk length in case of ranges)                                                 // 124
  self.addHeader('Content-Length', contentLength);                                                                   // 125
                                                                                                                     // 126
  // Last modified header (updatedAt from file info)                                                                 // 127
  self.addHeader('Last-Modified', copyInfo.updatedAt.toUTCString());                                                 // 128
                                                                                                                     // 129
  // Inform clients that we accept ranges for resumable chunked downloads                                            // 130
  self.addHeader('Accept-Ranges', 'bytes');                                                                          // 131
                                                                                                                     // 132
  //ref.file.createReadStream(storeName).pipe(self.createWriteStream());                                             // 133
  var readStream = storage.adapter.createReadStream(ref.file);                                                       // 134
                                                                                                                     // 135
  readStream.on('error', function(err) {                                                                             // 136
    // Send proper error message on get error                                                                        // 137
    if (err.message && err.statusCode) {                                                                             // 138
      self.Error(new Meteor.Error(err.statusCode, err.message));                                                     // 139
    } else {                                                                                                         // 140
      self.Error(new Meteor.Error(503, 'Service unavailable'));                                                      // 141
    }                                                                                                                // 142
  });                                                                                                                // 143
  readStream.pipe(self.createWriteStream());                                                                         // 144
                                                                                                                     // 145
};                                                                                                                   // 146
                                                                                                                     // 147
httpPutInsertHandler = function httpPutInsertHandler(ref) {                                                          // 148
  var self = this;                                                                                                   // 149
  var opts = FS.Utility.extend({}, self.query || {}, self.params || {});                                             // 150
                                                                                                                     // 151
  FS.debug && console.log("HTTP PUT (insert) handler");                                                              // 152
                                                                                                                     // 153
  // Create the nice FS.File                                                                                         // 154
  var fileObj = new FS.File();                                                                                       // 155
                                                                                                                     // 156
  // Set its name                                                                                                    // 157
  fileObj.name(opts.filename || null);                                                                               // 158
                                                                                                                     // 159
  // Attach the readstream as the file's data                                                                        // 160
  fileObj.attachData(self.createReadStream(), {type: self.requestHeaders['content-type'] || 'application/octet-stream'});
                                                                                                                     // 162
  // Validate with insert allow/deny                                                                                 // 163
  FS.Utility.validateAction(ref.collection.files._validators['insert'], file, self.userId);                          // 164
                                                                                                                     // 165
  // Insert file into collection, triggering readStream storage                                                      // 166
  ref.collection.insert(fileObj);                                                                                    // 167
                                                                                                                     // 168
  // Send response                                                                                                   // 169
  self.setStatusCode(200);                                                                                           // 170
                                                                                                                     // 171
  // Return the new file id                                                                                          // 172
  return {_id: fileObj._id};                                                                                         // 173
};                                                                                                                   // 174
                                                                                                                     // 175
httpPutUpdateHandler = function httpPutUpdateHandler(ref) {                                                          // 176
  var self = this;                                                                                                   // 177
  var opts = FS.Utility.extend({}, self.query || {}, self.params || {});                                             // 178
                                                                                                                     // 179
  var chunk = parseInt(opts.chunk, 10);                                                                              // 180
  if (isNaN(chunk)) chunk = 0;                                                                                       // 181
                                                                                                                     // 182
  FS.debug && console.log("HTTP PUT (update) handler received chunk: ", chunk);                                      // 183
                                                                                                                     // 184
  // Validate with insert allow/deny; also mounts and retrieves the file                                             // 185
  FS.Utility.validateAction(ref.collection.files._validators['insert'], ref.file, self.userId);                      // 186
                                                                                                                     // 187
  self.createReadStream().pipe( FS.TempStore.createWriteStream(ref.file, chunk) );                                   // 188
                                                                                                                     // 189
  // Send response                                                                                                   // 190
  self.setStatusCode(200);                                                                                           // 191
                                                                                                                     // 192
  return { _id: ref.file._id, chunk: chunk };                                                                        // 193
};                                                                                                                   // 194
                                                                                                                     // 195
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/cfs:access-point/access-point-server.js                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
var path = Npm.require("path");                                                                                      // 1
                                                                                                                     // 2
HTTP.publishFormats({                                                                                                // 3
  fileRecordFormat: function (input) {                                                                               // 4
    // Set the method scope content type to json                                                                     // 5
    this.setContentType('application/json');                                                                         // 6
    if (FS.Utility.isArray(input)) {                                                                                 // 7
      return EJSON.stringify(FS.Utility.map(input, function (obj) {                                                  // 8
        return FS.Utility.cloneFileRecord(obj);                                                                      // 9
      }));                                                                                                           // 10
    } else {                                                                                                         // 11
      return EJSON.stringify(FS.Utility.cloneFileRecord(input));                                                     // 12
    }                                                                                                                // 13
  }                                                                                                                  // 14
});                                                                                                                  // 15
                                                                                                                     // 16
/**                                                                                                                  // 17
 * @method FS.HTTP.setHeadersForGet                                                                                  // 18
 * @public                                                                                                           // 19
 * @param {Array} headers - List of headers, where each is a two-item array in which item 1 is the header name and item 2 is the header value.
 * @param {Array|String} [collections] - Which collections the headers should be added for. Omit this argument to add the header for all collections.
 * @returns {undefined}                                                                                              // 22
 */                                                                                                                  // 23
FS.HTTP.setHeadersForGet = function setHeadersForGet(headers, collections) {                                         // 24
  if (typeof collections === "string") {                                                                             // 25
    collections = [collections];                                                                                     // 26
  }                                                                                                                  // 27
  if (collections) {                                                                                                 // 28
    FS.Utility.each(collections, function(collectionName) {                                                          // 29
      getHeadersByCollection[collectionName] = headers || [];                                                        // 30
    });                                                                                                              // 31
  } else {                                                                                                           // 32
    getHeaders = headers || [];                                                                                      // 33
  }                                                                                                                  // 34
};                                                                                                                   // 35
                                                                                                                     // 36
/**                                                                                                                  // 37
 * @method FS.HTTP.publish                                                                                           // 38
 * @public                                                                                                           // 39
 * @param {FS.Collection} collection                                                                                 // 40
 * @param {Function} func - Publish function that returns a cursor.                                                  // 41
 * @returns {undefined}                                                                                              // 42
 *                                                                                                                   // 43
 * Publishes all documents returned by the cursor at a GET URL                                                       // 44
 * with the format baseUrl/record/collectionName. The publish                                                        // 45
 * function `this` is similar to normal `Meteor.publish`.                                                            // 46
 */                                                                                                                  // 47
FS.HTTP.publish = function fsHttpPublish(collection, func) {                                                         // 48
  var name = baseUrl + '/record/' + collection.name;                                                                 // 49
  // Mount collection listing URL using http-publish package                                                         // 50
  HTTP.publish({                                                                                                     // 51
    name: name,                                                                                                      // 52
    defaultFormat: 'fileRecordFormat',                                                                               // 53
    collection: collection,                                                                                          // 54
    collectionGet: true,                                                                                             // 55
    collectionPost: false,                                                                                           // 56
    documentGet: true,                                                                                               // 57
    documentPut: false,                                                                                              // 58
    documentDelete: false                                                                                            // 59
  }, func);                                                                                                          // 60
                                                                                                                     // 61
  FS.debug && console.log("Registered HTTP method GET URLs:\n\n" + name + '\n' + name + '/:id\n');                   // 62
};                                                                                                                   // 63
                                                                                                                     // 64
/**                                                                                                                  // 65
 * @method FS.HTTP.unpublish                                                                                         // 66
 * @public                                                                                                           // 67
 * @param {FS.Collection} collection                                                                                 // 68
 * @returns {undefined}                                                                                              // 69
 *                                                                                                                   // 70
 * Unpublishes a restpoint created by a call to `FS.HTTP.publish`                                                    // 71
 */                                                                                                                  // 72
FS.HTTP.unpublish = function fsHttpUnpublish(collection) {                                                           // 73
  // Mount collection listing URL using http-publish package                                                         // 74
  HTTP.unpublish(baseUrl + '/record/' + collection.name);                                                            // 75
};                                                                                                                   // 76
                                                                                                                     // 77
_existingMountPoints = {};                                                                                           // 78
                                                                                                                     // 79
/**                                                                                                                  // 80
 * @method defaultSelectorFunction                                                                                   // 81
 * @private                                                                                                          // 82
 * @returns { collection, file }                                                                                     // 83
 *                                                                                                                   // 84
 * This is the default selector function                                                                             // 85
 */                                                                                                                  // 86
var defaultSelectorFunction = function() {                                                                           // 87
  var self = this;                                                                                                   // 88
  // Selector function                                                                                               // 89
  //                                                                                                                 // 90
  // This function will have to return the collection and the                                                        // 91
  // file. If file not found undefined is returned - if null is returned the                                         // 92
  // search was not possible                                                                                         // 93
  var opts = FS.Utility.extend({}, self.query || {}, self.params || {});                                             // 94
                                                                                                                     // 95
  // Get the collection name from the url                                                                            // 96
  var collectionName = opts.collectionName;                                                                          // 97
                                                                                                                     // 98
  // Get the id from the url                                                                                         // 99
  var id = opts.id;                                                                                                  // 100
                                                                                                                     // 101
  // Get the collection                                                                                              // 102
  var collection = FS._collections[collectionName];                                                                  // 103
                                                                                                                     // 104
  // Get the file if possible else return null                                                                       // 105
  var file = (id && collection)? collection.findOne({ _id: id }): null;                                              // 106
                                                                                                                     // 107
  // Return the collection and the file                                                                              // 108
  return {                                                                                                           // 109
    collection: collection,                                                                                          // 110
    file: file,                                                                                                      // 111
    storeName: opts.store,                                                                                           // 112
    download: opts.download,                                                                                         // 113
    filename: opts.filename                                                                                          // 114
  };                                                                                                                 // 115
};                                                                                                                   // 116
                                                                                                                     // 117
/*                                                                                                                   // 118
 * @method FS.HTTP.mount                                                                                             // 119
 * @public                                                                                                           // 120
 * @param {array of string} mountPoints mount points to map rest functinality on                                     // 121
 * @param {function} selector_f [selector] function returns `{ collection, file }` for mount points to work with     // 122
 *                                                                                                                   // 123
*/                                                                                                                   // 124
FS.HTTP.mount = function(mountPoints, selector_f) {                                                                  // 125
  // We take mount points as an array and we get a selector function                                                 // 126
  var selectorFunction = selector_f || defaultSelectorFunction;                                                      // 127
                                                                                                                     // 128
  var accessPoint = {                                                                                                // 129
    'stream': true,                                                                                                  // 130
    'auth': expirationAuth,                                                                                          // 131
    'post': function(data) {                                                                                         // 132
      // Use the selector for finding the collection and file reference                                              // 133
      var ref = selectorFunction.call(this);                                                                         // 134
                                                                                                                     // 135
      // We dont support post - this would be normal insert eg. of filerecord?                                       // 136
      throw new Meteor.Error(501, "Not implemented", "Post is not supported");                                       // 137
    },                                                                                                               // 138
    'put': function(data) {                                                                                          // 139
      // Use the selector for finding the collection and file reference                                              // 140
      var ref = selectorFunction.call(this);                                                                         // 141
                                                                                                                     // 142
      // Make sure we have a collection reference                                                                    // 143
      if (!ref.collection)                                                                                           // 144
        throw new Meteor.Error(404, "Not Found", "No collection found");                                             // 145
                                                                                                                     // 146
      // Make sure we have a file reference                                                                          // 147
      if (ref.file === null) {                                                                                       // 148
        // No id supplied so we will create a new FS.File instance and                                               // 149
        // insert the supplied data.                                                                                 // 150
        return httpPutInsertHandler.apply(this, [ref]);                                                              // 151
      } else {                                                                                                       // 152
        if (ref.file) {                                                                                              // 153
          return httpPutUpdateHandler.apply(this, [ref]);                                                            // 154
        } else {                                                                                                     // 155
          throw new Meteor.Error(404, "Not Found", 'No file found');                                                 // 156
        }                                                                                                            // 157
      }                                                                                                              // 158
    },                                                                                                               // 159
    'get': function(data) {                                                                                          // 160
      // Use the selector for finding the collection and file reference                                              // 161
      var ref = selectorFunction.call(this);                                                                         // 162
                                                                                                                     // 163
      // Make sure we have a collection reference                                                                    // 164
      if (!ref.collection)                                                                                           // 165
        throw new Meteor.Error(404, "Not Found", "No collection found");                                             // 166
                                                                                                                     // 167
      // Make sure we have a file reference                                                                          // 168
      if (ref.file === null) {                                                                                       // 169
        // No id supplied so we will return the published list of files ala                                          // 170
        // http.publish in json format                                                                               // 171
        return httpGetListHandler.apply(this, [ref]);                                                                // 172
      } else {                                                                                                       // 173
        if (ref.file) {                                                                                              // 174
          return httpGetHandler.apply(this, [ref]);                                                                  // 175
        } else {                                                                                                     // 176
          throw new Meteor.Error(404, "Not Found", 'No file found');                                                 // 177
        }                                                                                                            // 178
      }                                                                                                              // 179
    },                                                                                                               // 180
    'delete': function(data) {                                                                                       // 181
      // Use the selector for finding the collection and file reference                                              // 182
      var ref = selectorFunction.call(this);                                                                         // 183
                                                                                                                     // 184
      // Make sure we have a collection reference                                                                    // 185
      if (!ref.collection)                                                                                           // 186
        throw new Meteor.Error(404, "Not Found", "No collection found");                                             // 187
                                                                                                                     // 188
      // Make sure we have a file reference                                                                          // 189
      if (ref.file) {                                                                                                // 190
        return httpDelHandler.apply(this, [ref]);                                                                    // 191
      } else {                                                                                                       // 192
        throw new Meteor.Error(404, "Not Found", 'No file found');                                                   // 193
      }                                                                                                              // 194
    }                                                                                                                // 195
  };                                                                                                                 // 196
                                                                                                                     // 197
  var accessPoints = {};                                                                                             // 198
                                                                                                                     // 199
  // Add debug message                                                                                               // 200
  FS.debug && console.log('Registered HTTP method URLs:');                                                           // 201
                                                                                                                     // 202
  FS.Utility.each(mountPoints, function(mountPoint) {                                                                // 203
    // Couple mountpoint and accesspoint                                                                             // 204
    accessPoints[mountPoint] = accessPoint;                                                                          // 205
    // Remember our mountpoints                                                                                      // 206
    _existingMountPoints[mountPoint] = mountPoint;                                                                   // 207
    // Add debug message                                                                                             // 208
    FS.debug && console.log(mountPoint);                                                                             // 209
  });                                                                                                                // 210
                                                                                                                     // 211
  // XXX: HTTP:methods should unmount existing mounts in case of overwriting?                                        // 212
  HTTP.methods(accessPoints);                                                                                        // 213
                                                                                                                     // 214
};                                                                                                                   // 215
                                                                                                                     // 216
/**                                                                                                                  // 217
 * @method FS.HTTP.unmount                                                                                           // 218
 * @public                                                                                                           // 219
 * @param {string | array of string} [mountPoints] Optional, if not specified all mountpoints are unmounted          // 220
 *                                                                                                                   // 221
 */                                                                                                                  // 222
FS.HTTP.unmount = function(mountPoints) {                                                                            // 223
  // The mountPoints is optional, can be string or array if undefined then                                           // 224
  // _existingMountPoints will be used                                                                               // 225
  var unmountList;                                                                                                   // 226
  // Container for the mount points to unmount                                                                       // 227
  var unmountPoints = {};                                                                                            // 228
                                                                                                                     // 229
  if (typeof mountPoints === 'undefined') {                                                                          // 230
    // Use existing mount points - unmount all                                                                       // 231
    unmountList = _existingMountPoints;                                                                              // 232
  } else if (mountPoints === ''+mountPoints) {                                                                       // 233
    // Got a string                                                                                                  // 234
    unmountList = [mountPoints];                                                                                     // 235
  } else if (mountPoints.length) {                                                                                   // 236
    // Got an array                                                                                                  // 237
    unmountList = mountPoints;                                                                                       // 238
  }                                                                                                                  // 239
                                                                                                                     // 240
  // If we have a list to unmount                                                                                    // 241
  if (unmountList) {                                                                                                 // 242
    // Iterate over each item                                                                                        // 243
    FS.Utility.each(unmountList, function(mountPoint) {                                                              // 244
      // Check _existingMountPoints to make sure the mount point exists in our                                       // 245
      // context / was created by the FS.HTTP.mount                                                                  // 246
      if (_existingMountPoints[mountPoint]) {                                                                        // 247
        // Mark as unmount                                                                                           // 248
        unmountPoints[mountPoint] = false;                                                                           // 249
        // Release                                                                                                   // 250
        delete _existingMountPoints[mountPoint];                                                                     // 251
      }                                                                                                              // 252
    });                                                                                                              // 253
    FS.debug && console.log('FS.HTTP.unmount:');                                                                     // 254
    FS.debug && console.log(unmountPoints);                                                                          // 255
    // Complete unmount                                                                                              // 256
    HTTP.methods(unmountPoints);                                                                                     // 257
  }                                                                                                                  // 258
};                                                                                                                   // 259
                                                                                                                     // 260
// ### FS.Collection maps on HTTP pr. default on the following restpoints:                                           // 261
// *                                                                                                                 // 262
//    baseUrl + '/files/:collectionName/:id/:filename',                                                              // 263
//    baseUrl + '/files/:collectionName/:id',                                                                        // 264
//    baseUrl + '/files/:collectionName'                                                                             // 265
//                                                                                                                   // 266
// Change/ replace the existing mount point by:                                                                      // 267
// ```js                                                                                                             // 268
//   // unmount all existing                                                                                         // 269
//   FS.HTTP.unmount();                                                                                              // 270
//   // Create new mount point                                                                                       // 271
//   FS.HTTP.mount([                                                                                                 // 272
//    '/cfs/files/:collectionName/:id/:filename',                                                                    // 273
//    '/cfs/files/:collectionName/:id',                                                                              // 274
//    '/cfs/files/:collectionName'                                                                                   // 275
//  ]);                                                                                                              // 276
//  ```                                                                                                              // 277
//                                                                                                                   // 278
mountUrls = function mountUrls() {                                                                                   // 279
  // We unmount first in case we are calling this a second time                                                      // 280
  FS.HTTP.unmount();                                                                                                 // 281
                                                                                                                     // 282
  FS.HTTP.mount([                                                                                                    // 283
    baseUrl + '/files/:collectionName/:id/:filename',                                                                // 284
    baseUrl + '/files/:collectionName/:id',                                                                          // 285
    baseUrl + '/files/:collectionName'                                                                               // 286
  ]);                                                                                                                // 287
};                                                                                                                   // 288
                                                                                                                     // 289
// Returns the userId from URL token                                                                                 // 290
var expirationAuth = function expirationAuth() {                                                                     // 291
  var self = this;                                                                                                   // 292
                                                                                                                     // 293
  // Read the token from '/hello?token=base64'                                                                       // 294
  var encodedToken = self.query.token;                                                                               // 295
                                                                                                                     // 296
  FS.debug && console.log("token: "+encodedToken);                                                                   // 297
                                                                                                                     // 298
  if (!encodedToken || !Meteor.users) return false;                                                                  // 299
                                                                                                                     // 300
  // Check the userToken before adding it to the db query                                                            // 301
  // Set the this.userId                                                                                             // 302
  var tokenString = FS.Utility.atob(encodedToken);                                                                   // 303
                                                                                                                     // 304
  var tokenObject;                                                                                                   // 305
  try {                                                                                                              // 306
    tokenObject = JSON.parse(tokenString);                                                                           // 307
  } catch(err) {                                                                                                     // 308
    throw new Meteor.Error(400, 'Bad Request');                                                                      // 309
  }                                                                                                                  // 310
                                                                                                                     // 311
  // XXX: Do some check here of the object                                                                           // 312
  var userToken = tokenObject.authToken;                                                                             // 313
  if (userToken !== ''+userToken) {                                                                                  // 314
    throw new Meteor.Error(400, 'Bad Request');                                                                      // 315
  }                                                                                                                  // 316
                                                                                                                     // 317
  // If we have an expiration token we should check that it's still valid                                            // 318
  if (tokenObject.expiration != null) {                                                                              // 319
    // check if its too old                                                                                          // 320
    var now = Date.now();                                                                                            // 321
    if (tokenObject.expiration < now) {                                                                              // 322
      FS.debug && console.log('Expired token: ' + tokenObject.expiration + ' is less than ' + now);                  // 323
      throw new Meteor.Error(500, 'Expired token');                                                                  // 324
    }                                                                                                                // 325
  }                                                                                                                  // 326
                                                                                                                     // 327
  // We are not on a secure line - so we have to look up the user...                                                 // 328
  var user = Meteor.users.findOne({                                                                                  // 329
    $or: [                                                                                                           // 330
      {'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(userToken)},                              // 331
      {'services.resume.loginTokens.token': userToken}                                                               // 332
    ]                                                                                                                // 333
  });                                                                                                                // 334
                                                                                                                     // 335
  // Set the userId in the scope                                                                                     // 336
  return user && user._id;                                                                                           // 337
};                                                                                                                   // 338
                                                                                                                     // 339
HTTP.methods(                                                                                                        // 340
  {'/cfs/servertime': {                                                                                              // 341
    get: function(data) {                                                                                            // 342
      return Date.now().toString();                                                                                  // 343
    }                                                                                                                // 344
  }                                                                                                                  // 345
});                                                                                                                  // 346
                                                                                                                     // 347
// Unify client / server api                                                                                         // 348
FS.HTTP.now = function() {                                                                                           // 349
  return Date.now();                                                                                                 // 350
};                                                                                                                   // 351
                                                                                                                     // 352
// Start up the basic mount points                                                                                   // 353
Meteor.startup(function () {                                                                                         // 354
  mountUrls();                                                                                                       // 355
});                                                                                                                  // 356
                                                                                                                     // 357
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['cfs:access-point'] = {};

})();

//# sourceMappingURL=cfs_access-point.js.map
