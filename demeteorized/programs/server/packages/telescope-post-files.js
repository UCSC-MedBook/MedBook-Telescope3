(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var gm = Package['cfs:graphicsmagick'].gm;
var Router = Package['iron:router'].Router;
var RouteController = Package['iron:router'].RouteController;
var numeral = Package['mrt:numeral'].numeral;
var MIME = Package['patte:mime-npm'].MIME;
var deepExtend = Package['telescope-lib'].deepExtend;
var camelToDash = Package['telescope-lib'].camelToDash;
var dashToCamel = Package['telescope-lib'].dashToCamel;
var camelCaseify = Package['telescope-lib'].camelCaseify;
var getSetting = Package['telescope-lib'].getSetting;
var getThemeSetting = Package['telescope-lib'].getThemeSetting;
var getSiteUrl = Package['telescope-lib'].getSiteUrl;
var trimWords = Package['telescope-lib'].trimWords;
var can = Package['telescope-lib'].can;
var _ = Package.underscore._;
var capitalise = Package['telescope-lib'].capitalise;
var adminNav = Package['telescope-base'].adminNav;
var viewNav = Package['telescope-base'].viewNav;
var addToPostSchema = Package['telescope-base'].addToPostSchema;
var addToCommentsSchema = Package['telescope-base'].addToCommentsSchema;
var addToSettingsSchema = Package['telescope-base'].addToSettingsSchema;
var preloadSubscriptions = Package['telescope-base'].preloadSubscriptions;
var primaryNav = Package['telescope-base'].primaryNav;
var secondaryNav = Package['telescope-base'].secondaryNav;
var viewParameters = Package['telescope-base'].viewParameters;
var footerModules = Package['telescope-base'].footerModules;
var heroModules = Package['telescope-base'].heroModules;
var postModules = Package['telescope-base'].postModules;
var postHeading = Package['telescope-base'].postHeading;
var postMeta = Package['telescope-base'].postMeta;
var modulePositions = Package['telescope-base'].modulePositions;
var postSubmitRenderedCallbacks = Package['telescope-base'].postSubmitRenderedCallbacks;
var postSubmitClientCallbacks = Package['telescope-base'].postSubmitClientCallbacks;
var postSubmitMethodCallbacks = Package['telescope-base'].postSubmitMethodCallbacks;
var postAfterSubmitMethodCallbacks = Package['telescope-base'].postAfterSubmitMethodCallbacks;
var postEditRenderedCallbacks = Package['telescope-base'].postEditRenderedCallbacks;
var postEditClientCallbacks = Package['telescope-base'].postEditClientCallbacks;
var postEditMethodCallbacks = Package['telescope-base'].postEditMethodCallbacks;
var postAfterEditMethodCallbacks = Package['telescope-base'].postAfterEditMethodCallbacks;
var commentSubmitRenderedCallbacks = Package['telescope-base'].commentSubmitRenderedCallbacks;
var commentSubmitClientCallbacks = Package['telescope-base'].commentSubmitClientCallbacks;
var commentSubmitMethodCallbacks = Package['telescope-base'].commentSubmitMethodCallbacks;
var commentAfterSubmitMethodCallbacks = Package['telescope-base'].commentAfterSubmitMethodCallbacks;
var commentEditRenderedCallbacks = Package['telescope-base'].commentEditRenderedCallbacks;
var commentEditClientCallbacks = Package['telescope-base'].commentEditClientCallbacks;
var commentEditMethodCallbacks = Package['telescope-base'].commentEditMethodCallbacks;
var commentAfterEditMethodCallbacks = Package['telescope-base'].commentAfterEditMethodCallbacks;
var getTemplate = Package['telescope-base'].getTemplate;
var templates = Package['telescope-base'].templates;
var themeSettings = Package['telescope-base'].themeSettings;
var TAPi18next = Package['tap:i18n'].TAPi18next;
var TAPi18n = Package['tap:i18n'].TAPi18n;
var FS = Package['cfs:base-package'].FS;
var Iron = Package['iron:core'].Iron;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var Log = Package.logging.Log;
var Tracker = Package.deps.Tracker;
var Deps = Package.deps.Deps;
var DDP = Package.livedata.DDP;
var DDPServer = Package.livedata.DDPServer;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var Blaze = Package.ui.Blaze;
var UI = Package.ui.UI;
var Handlebars = Package.ui.Handlebars;
var Spacebars = Package.spacebars.Spacebars;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var HTML = Package.htmljs.HTML;

/* Package-scope variables */
var preloadSubscriptions, adminNav, Categories, addToPostSchema, primaryNav, postModules, Collections, AutoForm, FS, httpGetHandler, Stores, PostUrl;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-post-files/server/files.js                                                                     //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
                                                                                                                     // 1
Meteor.startup(function () {                                                                                         // 2
                                                                                                                     // 3
  // My auth will return the userId                                                                                  // 4
  var myAuth = function() {                                                                                          // 5
        // Read the token from '/hello?token=5'                                                                      // 6
        var userToken = self.query.token;                                                                            // 7
        // Check the userToken before adding it to the db query                                                      // 8
        // Set the this.userId                                                                                       // 9
        if (userToken) {                                                                                             // 10
          var user = Meteor.users.findOne({ 'services.resume.loginTokens.token': userToken });                       // 11
                                                                                                                     // 12
          // Set the userId in the scope                                                                             // 13
          return user && user._id;                                                                                   // 14
        }                                                                                                            // 15
      };                                                                                                             // 16
                                                                                                                     // 17
    function readCookie(cookieHeader, cookieName) {                                                                  // 18
     var re = new RegExp('[; ]'+cookieName+'=([^\\s;]*)');                                                           // 19
     var sMatch = (' '+cookieHeader).match(re);                                                                      // 20
     if (cookieName && sMatch) return unescape(sMatch[1]);                                                           // 21
     return  null;                                                                                                   // 22
    }                                                                                                                // 23
                                                                                                                     // 24
    function auth() {                                                                                                // 25
        var meteor_login_token = this.req.cookies.meteor_login_token;                                                // 26
        if (meteor_login_token) {                                                                                    // 27
             var user = Meteor.users.findOne({"services.resume.loginTokens.hashedToken": Accounts._hashLoginToken(meteor_login_token)});
             if (user)                                                                                               // 29
                 return user._id;                                                                                    // 30
        }                                                                                                            // 31
        return null;                                                                                                 // 32
    }                                                                                                                // 33
                                                                                                                     // 34
//copied from Meteor-cfs-access-point                                                                                // 35
                                                                                                                     // 36
                                                                                                                     // 37
/**                                                                                                                  // 38
 * @method defaultSelectorFunction                                                                                   // 39
 * @private                                                                                                          // 40
 * @returns { collection, file }                                                                                     // 41
 *                                                                                                                   // 42
 * This is the default selector function                                                                             // 43
 */                                                                                                                  // 44
var defaultSelectorFunction = function() {                                                                           // 45
  var self = this;                                                                                                   // 46
  // Selector function                                                                                               // 47
  //                                                                                                                 // 48
  // This function will have to return the collection and the                                                        // 49
  // file. If file not found undefined is returned - if null is returned the                                         // 50
  // search was not possible                                                                                         // 51
  var opts = FS.Utility.extend({}, self.query || {}, self.params || {});                                             // 52
                                                                                                                     // 53
  // Get the collection name from the url                                                                            // 54
  var collectionName = "files";                                                                                      // 55
                                                                                                                     // 56
  // Get the id from the url                                                                                         // 57
  var id = opts.id;                                                                                                  // 58
                                                                                                                     // 59
  // Get the collection                                                                                              // 60
  var collection = FS._collections[collectionName];                                                                  // 61
                                                                                                                     // 62
  // Get the file if possible else return null                                                                       // 63
  var q = ({post: this.params.postId, 'original.name': this.params.name});                                           // 64
  var file =  Collections.Files.findOne(q);                                                                          // 65
  console.log(">>>>>>>>>>>> q=", q, " file", file);                                                                  // 66
                                                                                                                     // 67
  if (file == null) {                                                                                                // 68
      q = ({owner: this.params.postId, 'original.name': this.params.name});                                          // 69
      file =  Collections.Files.findOne(q);                                                                          // 70
      console.log(">>>>>>>>>>>> q=", q, " file", file);                                                              // 71
  }                                                                                                                  // 72
                                                                                                                     // 73
  // Return the collection and the file                                                                              // 74
  return {                                                                                                           // 75
    collection: collection,                                                                                          // 76
    file: file,                                                                                                      // 77
    storeName: opts.store,                                                                                           // 78
    download: opts.download,                                                                                         // 79
    filename: opts.filename                                                                                          // 80
  };                                                                                                                 // 81
};                                                                                                                   // 82
                                                                                                                     // 83
/**                                                                                                                  // 84
 * @method httpGetHandler                                                                                            // 85
 * @private                                                                                                          // 86
 * @returns {any} response                                                                                           // 87
 *                                                                                                                   // 88
 * HTTP GET request handler                                                                                          // 89
 */                                                                                                                  // 90
httpGetHandler = function httpGetHandler(ref) {                                                                      // 91
  var self = this;                                                                                                   // 92
  // Once we have the file, we can test allow/deny validators                                                        // 93
  // XXX: pass on the "share" query eg. ?share=342hkjh23ggj for shared url access?                                   // 94
  FS.Utility.validateAction(ref.collection._validators['download'], ref.file, self.userId /*, self.query.shareId*/); // 95
                                                                                                                     // 96
  var storeName = ref.storeName;                                                                                     // 97
                                                                                                                     // 98
  // If no storeName was specified, use the first defined storeName                                                  // 99
  if (typeof storeName !== "string") {                                                                               // 100
    // No store handed, we default to primary store                                                                  // 101
    storeName = ref.collection.primaryStore.name;                                                                    // 102
  }                                                                                                                  // 103
                                                                                                                     // 104
  // Get the storage reference                                                                                       // 105
  var storage = ref.collection.storesLookup[storeName];                                                              // 106
                                                                                                                     // 107
  if (!storage) {                                                                                                    // 108
    throw new Meteor.Error(404, "Not Found", 'There is no store "' + storeName + '"');                               // 109
  }                                                                                                                  // 110
                                                                                                                     // 111
  // Get the file                                                                                                    // 112
  var copyInfo = ref.file.copies[storeName];                                                                         // 113
                                                                                                                     // 114
  if (!copyInfo) {                                                                                                   // 115
    throw new Meteor.Error(404, "Not Found", 'This file was not stored in the ' + storeName + ' store');             // 116
  }                                                                                                                  // 117
                                                                                                                     // 118
  var fileType = copyInfo.type;                                                                                      // 119
  var fileSize = copyInfo.size;                                                                                      // 120
                                                                                                                     // 121
  if (typeof fileType === "string") {                                                                                // 122
    self.setContentType(fileType);                                                                                   // 123
  } else {                                                                                                           // 124
    self.setContentType('application/octet-stream');                                                                 // 125
  }                                                                                                                  // 126
                                                                                                                     // 127
  // Add 'Content-Disposition' header if requested a download/attachment URL                                         // 128
  if (typeof ref.download !== "undefined") {                                                                         // 129
    var filename = ref.filename || copyInfo.name;                                                                    // 130
    self.addHeader('Content-Disposition', 'attachment; filename="' + filename + '"');                                // 131
  } else {                                                                                                           // 132
    self.addHeader('Content-Disposition', 'inline');                                                                 // 133
  }                                                                                                                  // 134
                                                                                                                     // 135
  // If a chunk/range was requested instead of the whole file, serve that'                                           // 136
  var start, end, unit, contentLength, readStreamOptions, range = self.requestHeaders.range;                         // 137
  if (range) {                                                                                                       // 138
    // Parse range header                                                                                            // 139
    range = range.split('=');                                                                                        // 140
                                                                                                                     // 141
    unit = range[0];                                                                                                 // 142
    if (unit !== 'bytes')                                                                                            // 143
      throw new Meteor.Error(416, "Requested Range Not Satisfiable");                                                // 144
                                                                                                                     // 145
    range = range[1];                                                                                                // 146
    // Spec allows multiple ranges, but we will serve only the first                                                 // 147
    range = range.split(',')[0];                                                                                     // 148
    // Get start and end byte positions                                                                              // 149
    range = range.split('-');                                                                                        // 150
    start = range[0];                                                                                                // 151
    end = range[1] || '';                                                                                            // 152
    // Convert to numbers and adjust invalid values when possible                                                    // 153
    start = start.length ? Math.max(Number(start), 0) : 0;                                                           // 154
    end = end.length ? Math.min(Number(end), fileSize - 1) : fileSize - 1;                                           // 155
    if (end < start)                                                                                                 // 156
      throw new Meteor.Error(416, "Requested Range Not Satisfiable");                                                // 157
                                                                                                                     // 158
    self.addHeader('Content-Range', 'bytes ' + start + '-' + end + '/' + copyInfo.size);                             // 159
    readStreamOptions = {start: start, end: end};                                                                    // 160
    end = end + 1; //HTTP end byte is inclusive and ours are not                                                     // 161
                                                                                                                     // 162
    // Sets properly content length for range                                                                        // 163
    contentLength = end - start;                                                                                     // 164
  } else {                                                                                                           // 165
    // Content length, defaults to file size                                                                         // 166
    contentLength = fileSize;                                                                                        // 167
    // Some browsers cope better if the content-range header is                                                      // 168
    // still included even for the full file being returned.                                                         // 169
    self.addHeader('Content-Range', 'bytes 0-' + (contentLength - 1) + '/' + contentLength);                         // 170
  }                                                                                                                  // 171
                                                                                                                     // 172
  if (contentLength < fileSize) {                                                                                    // 173
    self.setStatusCode(206, 'Partial Content');                                                                      // 174
  } else {                                                                                                           // 175
    self.setStatusCode(200, 'OK');                                                                                   // 176
  }                                                                                                                  // 177
                                                                                                                     // 178
  // Add any other global custom headers and collection-specific custom headers                                      // 179
  /*                                                                                                                 // 180
  FS.Utility.each(getHeaders.concat(getHeadersByCollection[ref.collection.name] || []), function(header) {           // 181
    self.addHeader(header[0], header[1]);                                                                            // 182
  });                                                                                                                // 183
  */                                                                                                                 // 184
                                                                                                                     // 185
  // Inform clients about length (or chunk length in case of ranges)                                                 // 186
  self.addHeader('Content-Length', contentLength);                                                                   // 187
                                                                                                                     // 188
  // Last modified header (updatedAt from file info)                                                                 // 189
  self.addHeader('Last-Modified', copyInfo.updatedAt.toUTCString());                                                 // 190
                                                                                                                     // 191
  // Inform clients that we accept ranges for resumable chunked downloads                                            // 192
  self.addHeader('Accept-Ranges', 'bytes');                                                                          // 193
                                                                                                                     // 194
  var readStream = storage.adapter.createReadStream(ref.file, readStreamOptions);                                    // 195
                                                                                                                     // 196
  readStream.on('error', function(err) {                                                                             // 197
    // Send proper error message on get error                                                                        // 198
    if (err.message && err.statusCode) {                                                                             // 199
      self.Error(new Meteor.Error(err.statusCode, err.message));                                                     // 200
    } else {                                                                                                         // 201
      self.Error(new Meteor.Error(503, 'Service unavailable'));                                                      // 202
    }                                                                                                                // 203
  });                                                                                                                // 204
                                                                                                                     // 205
  readStream.pipe(self.createWriteStream());                                                                         // 206
};                                                                                                                   // 207
                                                                                                                     // 208
                                                                                                                     // 209
    function get_postFileGetRequest(numArgs) {                                                                       // 210
        return function postFileGetRequest() {                                                                       // 211
            if (numArgs == 0) {                                                                                      // 212
              var result ="";                                                                                        // 213
              var postId = this.params.postId;                                                                       // 214
              Collections.Files.find({post: postId}, { sort: {name:1}}).forEach(function(f) {                        // 215
                  result += "<a target='_blank' href='" + PostUrl(f)  + "'>" +  f.name()+"</a><br>";                 // 216
              });                                                                                                    // 217
              return result;                                                                                         // 218
            } else {                                                                                                 // 219
              var name = this.params[''+0]                                                                           // 220
              for (var i = 1; i < numArgs; i++) {                                                                    // 221
                 name += "/" + this.params[''+i]                                                                     // 222
              }                                                                                                      // 223
              this.params.name = name;                                                                               // 224
              var fileRef = defaultSelectorFunction.apply(this);                                                     // 225
              httpGetHandler.call(this, fileRef);                                                                    // 226
              // return numArgs + ' <b>posts filename username=</b>'+ this.userId;                                   // 227
            }                                                                                                        // 228
        }                                                                                                            // 229
    }                                                                                                                // 230
                                                                                                                     // 231
                                                                                                                     // 232
                                                                                                                     // 233
                                                                                                                     // 234
                                                                                                                     // 235
    var methodParam = {};                                                                                            // 236
    var name =  'posts/:postId/file';                                                                                // 237
                                                                                                                     // 238
    for (var numArgs = 0; numArgs <= 100; numArgs ++) {                                                              // 239
        methodParam[name] = {  auth: auth, get: get_postFileGetRequest(numArgs)} ;                                   // 240
        name += "/";                                                                                                 // 241
        methodParam[name] = {  auth: auth, get: get_postFileGetRequest(numArgs)} ;                                   // 242
        name += ":" + numArgs;                                                                                       // 243
    }                                                                                                                // 244
                                                                                                                     // 245
    HTTP.methods(methodParam);                                                                                       // 246
                                                                                                                     // 247
});                                                                                                                  // 248
                                                                                                                     // 249
                                                                                                                     // 250
                                                                                                                     // 251
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-post-files/server/main.js                                                                      //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
Meteor.startup(function() {                                                                                          // 1
  //ImageUploads.remove({});                                                                                         // 2
  console.log("Images Uploads:", Collections.Images.find().count());                                                 // 3
  console.log("Files:", Collections.Files.find().count());                                                           // 4
                                                                                                                     // 5
  Collections.Images.on('removed', function (fileObj) {                                                              // 6
    console.log("Removed " + fileObj._id + " from Images collection.");                                              // 7
  });                                                                                                                // 8
});                                                                                                                  // 9
                                                                                                                     // 10
Meteor.methods({                                                                                                     // 11
  testUrlInsert: function() {                                                                                        // 12
    return Collections.Images.insert("http://cdn.morguefile.com/imageData/public/files/b/bboomerindenial/preview/fldr_2009_04_01/file3301238617907.jpg");
  },                                                                                                                 // 14
  testFileInsert: function () {                                                                                      // 15
    return Collections.Images.insert("/Users/Eric/Downloads/testfile.jpg");                                          // 16
  },                                                                                                                 // 17
  rotate: function() {                                                                                               // 18
    Collections.Images.find().forEach(function (fileObj) {                                                           // 19
      var readStream = fileObj.createReadStream('images');                                                           // 20
      var writeStream = fileObj.createWriteStream('images');                                                         // 21
      gm(readStream).swirl(180).stream().pipe(writeStream);                                                          // 22
    });                                                                                                              // 23
  }                                                                                                                  // 24
});                                                                                                                  // 25
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-post-files/server/publish.js                                                                   //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
Meteor.publish("postedFiles", function(postId) {                                                                     // 1
  return Collections.Files.find({post: postId});                                                                     // 2
});                                                                                                                  // 3
                                                                                                                     // 4
Meteor.publish("uploadedFiles", function() {                                                                         // 5
  return Collections.Files.find({owner: this.userId, post: { $exists: false}});                                      // 6
});                                                                                                                  // 7
                                                                                                                     // 8
Meteor.publish("docs", function() {                                                                                  // 9
  return Collections.Docs.find();                                                                                    // 10
});                                                                                                                  // 11
                                                                                                                     // 12
Meteor.publish("docs2", function() {                                                                                 // 13
  return Collections.Docs2.find();                                                                                   // 14
});                                                                                                                  // 15
                                                                                                                     // 16
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-post-files/server/posts.js                                                                     //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
                                                                                                                     // 1
postAfterSubmitMethodCallbacks.push(function(post){                                                                  // 2
                                                                                                                     // 3
    _.map( post.medbookfiles,                                                                                        // 4
         function(fid) {                                                                                             // 5
            console.log("postAfterSubmitMethodCallbacks.push fid pid", fid,  post._id);                              // 6
            Collections.Files.update({ _id: fid}, { $set: { post: post._id} })});                                    // 7
                                                                                                                     // 8
    return post;                                                                                                     // 9
});                                                                                                                  // 10
                                                                                                                     // 11
                                                                                                                     // 12
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-post-files/server/security.js                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
function trueFunc() {return true;}                                                                                   // 1
function falseFunc() {return false;}                                                                                 // 2
                                                                                                                     // 3
Meteor.startup(function() {                                                                                          // 4
                                                                                                                     // 5
    Collections.Files.allow({                                                                                        // 6
      insert: trueFunc,                                                                                              // 7
      update: trueFunc,                                                                                              // 8
      remove: trueFunc,                                                                                              // 9
      download: trueFunc                                                                                             // 10
    });                                                                                                              // 11
                                                                                                                     // 12
    Collections.Files.deny({                                                                                         // 13
      insert: falseFunc,                                                                                             // 14
      update: falseFunc,                                                                                             // 15
      remove: falseFunc,                                                                                             // 16
      download: falseFunc                                                                                            // 17
    });                                                                                                              // 18
                                                                                                                     // 19
    Collections.Images.allow({                                                                                       // 20
      insert: trueFunc,                                                                                              // 21
      update: trueFunc,                                                                                              // 22
      remove: trueFunc,                                                                                              // 23
      download: trueFunc                                                                                             // 24
    });                                                                                                              // 25
                                                                                                                     // 26
    Collections.Images.deny({                                                                                        // 27
      insert: falseFunc,                                                                                             // 28
      update: falseFunc,                                                                                             // 29
      remove: falseFunc,                                                                                             // 30
      download: falseFunc                                                                                            // 31
    });                                                                                                              // 32
                                                                                                                     // 33
    Collections.Docs.allow({                                                                                         // 34
      insert: trueFunc,                                                                                              // 35
      update: trueFunc,                                                                                              // 36
      remove: trueFunc                                                                                               // 37
    });                                                                                                              // 38
                                                                                                                     // 39
    Collections.Docs.deny({                                                                                          // 40
      insert: falseFunc,                                                                                             // 41
      update: falseFunc,                                                                                             // 42
      remove: falseFunc                                                                                              // 43
    });                                                                                                              // 44
                                                                                                                     // 45
    Collections.Docs2.allow({                                                                                        // 46
      insert: trueFunc,                                                                                              // 47
      update: trueFunc,                                                                                              // 48
      remove: trueFunc                                                                                               // 49
    });                                                                                                              // 50
                                                                                                                     // 51
    Collections.Docs2.deny({                                                                                         // 52
      insert: falseFunc,                                                                                             // 53
      update: falseFunc,                                                                                             // 54
      remove: falseFunc                                                                                              // 55
    });                                                                                                              // 56
});                                                                                                                  // 57
                                                                                                                     // 58
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-post-files/common/0_stores.js                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
Stores = {};                                                                                                         // 1
                                                                                                                     // 2
// var imageStore = new FS.Store.S3("images", {                                                                      // 3
//   accessKeyId: Meteor.settings.accessKeyId, //required                                                            // 4
//   secretAccessKey: Meteor.settings.secretAccessKey, //required                                                    // 5
//   bucket: Meteor.settings.imageStoreBucket //required                                                             // 6
// });                                                                                                               // 7
                                                                                                                     // 8
// var anyStore = new FS.Store.S3("any", {                                                                           // 9
//   accessKeyId: Meteor.settings.accessKeyId, //required                                                            // 10
//   secretAccessKey: Meteor.settings.secretAccessKey, //required                                                    // 11
//   bucket: Meteor.settings.anyStoreBucket //required                                                               // 12
// });                                                                                                               // 13
                                                                                                                     // 14
Stores.images = new FS.Store.GridFS("images");                                                                       // 15
Stores.thumbs = new FS.Store.GridFS("thumbs", {                                                                      // 16
  beforeWrite: function(fileObj) {                                                                                   // 17
    // We return an object, which will change the                                                                    // 18
    // filename extension and type for this store only.                                                              // 19
    return {                                                                                                         // 20
      extension: 'png',                                                                                              // 21
      type: 'image/png'                                                                                              // 22
    };                                                                                                               // 23
  },                                                                                                                 // 24
  transformWrite: function(fileObj, readStream, writeStream) {                                                       // 25
    // Transform the image into a 60px x 60px PNG thumbnail                                                          // 26
    gm(readStream).resize(60).stream('PNG').pipe(writeStream);                                                       // 27
    // The new file size will be automatically detected and set for this store                                       // 28
  }                                                                                                                  // 29
});                                                                                                                  // 30
                                                                                                                     // 31
if (Meteor.isServer) {                                                                                               // 32
    var mime = Npm.require("mime");                                                                                  // 33
    Stores.any = new FS.Store.GridFS("any",                                                                          // 34
        {                                                                                                            // 35
            beforeWrite: function(fileObj) {                                                                         // 36
                                                                                                                     // 37
            // HANDLE SPECIAL MEDBOOK MIME TYPES                                                                     // 38
                if (fileObj.original.type == "") {                                                                   // 39
                    var name = fileObj.name();                                                                       // 40
                    var type;                                                                                        // 41
                                                                                                                     // 42
                    if (name.match(/\.tab$/))                                                                        // 43
                        type = 'text/tab-separated-values';                                                          // 44
                    else                                                                                             // 45
                        type = mime.lookup(name);                                                                    // 46
                                                                                                                     // 47
                    fileObj.type(type);                                                                              // 48
                                                                                                                     // 49
                }                                                                                                    // 50
            }                                                                                                        // 51
        }                                                                                                            // 52
    );                                                                                                               // 53
} else                                                                                                               // 54
    Stores.any = new FS.Store.GridFS("any");                                                                         // 55
                                                                                                                     // 56
                                                                                                                     // 57
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-post-files/common/1_collections.js                                                             //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
Collections = {};                                                                                                    // 1
                                                                                                                     // 2
Meteor.isClient && Template.registerHelper("Collections", Collections);                                              // 3
                                                                                                                     // 4
Collections.Images = new FS.Collection("images", {                                                                   // 5
  stores: [                                                                                                          // 6
    Stores.images,                                                                                                   // 7
    Stores.thumbs                                                                                                    // 8
  ],                                                                                                                 // 9
  filter: {                                                                                                          // 10
    maxSize: 20 * 1024 * 1024, //in bytes                                                                            // 11
    allow: {                                                                                                         // 12
      contentTypes: ['image/*']                                                                                      // 13
    },                                                                                                               // 14
    onInvalid: function(message) {                                                                                   // 15
      Meteor.isClient && alert(message);                                                                             // 16
    }                                                                                                                // 17
  }                                                                                                                  // 18
});                                                                                                                  // 19
                                                                                                                     // 20
Collections.Files = new FS.Collection("files", {                                                                     // 21
  stores: [Stores.any],                                                                                              // 22
  chunkSize: 4 * 1024 * 1024                                                                                         // 23
});                                                                                                                  // 24
                                                                                                                     // 25
Collections.Docs = new Mongo.Collection("docs");                                                                     // 26
Collections.Docs.attachSchema(new SimpleSchema({                                                                     // 27
  name: {                                                                                                            // 28
    type: String                                                                                                     // 29
  },                                                                                                                 // 30
  fileId: {                                                                                                          // 31
    type: String,                                                                                                    // 32
    autoform: {                                                                                                      // 33
      type: "cfs-file",                                                                                              // 34
      collection: "files"                                                                                            // 35
    }                                                                                                                // 36
  }                                                                                                                  // 37
}));                                                                                                                 // 38
                                                                                                                     // 39
Collections.Docs2 = new Mongo.Collection("docs2");                                                                   // 40
Collections.Docs2.attachSchema(new SimpleSchema({                                                                    // 41
  name: {                                                                                                            // 42
    type: String                                                                                                     // 43
  },                                                                                                                 // 44
  fileId: {                                                                                                          // 45
    type: [String],                                                                                                  // 46
    autoform: {                                                                                                      // 47
      type: "cfs-files",                                                                                             // 48
      collection: "files"                                                                                            // 49
    }                                                                                                                // 50
  }                                                                                                                  // 51
}));                                                                                                                 // 52
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-post-files/common/common.js                                                                    //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
FS.debug = true; // enable CFS debug logging                                                                         // 1
                                                                                                                     // 2
// default GET request headers                                                                                       // 3
FS.HTTP.setHeadersForGet([                                                                                           // 4
  ['Cache-Control', 'public, max-age=31536000']                                                                      // 5
]);                                                                                                                  // 6
                                                                                                                     // 7
// GET request headers for the "any" store                                                                           // 8
FS.HTTP.setHeadersForGet([                                                                                           // 9
  ['foo', 'bar']                                                                                                     // 10
], 'any');                                                                                                           // 11
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-post-files/common/routes.js                                                                    //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
Router.configure({                                                                                                   // 1
  notFoundTemplate: 'not_found',                                                                                     // 2
  loadingTemplate: 'loading',                                                                                        // 3
  layoutTemplate: 'layout'                                                                                           // 4
});                                                                                                                  // 5
                                                                                                                     // 6
Router.onBeforeAction('loading');                                                                                    // 7
                                                                                                                     // 8
Router.map(function() {                                                                                              // 9
                                                                                                                     // 10
  this.route('images');                                                                                              // 11
  this.route('files');                                                                                               // 12
  this.route('autoformExample', {path: 'autoform'})                                                                  // 13
});                                                                                                                  // 14
                                                                                                                     // 15
if (Meteor.isClient) {                                                                                               // 16
                                                                                                                     // 17
  // Scroll to top or requested hash after loading each page                                                         // 18
  Router.onAfterAction(function() {                                                                                  // 19
    Meteor.setTimeout(function () {                                                                                  // 20
      var hash = $(window.location.hash);                                                                            // 21
      var scrollTo = hash.length ? hash.offset().top : 0;                                                            // 22
      $("html, body").animate({ scrollTop: scrollTo }, 700, "easeInOutQuart");                                       // 23
    }, 0);                                                                                                           // 24
  });                                                                                                                // 25
                                                                                                                     // 26
  // Route-related helpers                                                                                           // 27
  Template.registerHelper("absoluteUrl", function(path) {                                                            // 28
    return Meteor.absoluteUrl(path);                                                                                 // 29
  });                                                                                                                // 30
                                                                                                                     // 31
  Template.registerHelper("currentRouteIs", function(name) {                                                         // 32
    var current = Router.current();                                                                                  // 33
    return current && current.route && current.route.name === name || false;                                         // 34
  });                                                                                                                // 35
                                                                                                                     // 36
  Template.registerHelper("activeRoute", function(name) {                                                            // 37
    var current = Router.current();                                                                                  // 38
    return current && current.route && current.route.name === name && "active" || "";                                // 39
  });                                                                                                                // 40
                                                                                                                     // 41
}                                                                                                                    // 42
                                                                                                                     // 43
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-post-files/common/posts.js                                                                     //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
                                                                                                                     // 1
                                                                                                                     // 2
// push "fileId" property to addToPostSchema, so that it's later added to postSchema                                 // 3
                                                                                                                     // 4
Meteor.autorun(function() {                                                                                          // 5
    addToPostSchema.push(                                                                                            // 6
      {                                                                                                              // 7
        propertyName: 'medbookfiles',                                                                                // 8
        propertySchema: {                                                                                            // 9
          type: [String],                                                                                            // 10
          optional: true,                                                                                            // 11
    /*                                                                                                               // 12
          editable: true,                                                                                            // 13
          autoform: {                                                                                                // 14
            type: "cfs-files",                                                                                       // 15
            collection: "files"                                                                                      // 16
          }                                                                                                          // 17
    */                                                                                                               // 18
        }                                                                                                            // 19
      }                                                                                                              // 20
    );                                                                                                               // 21
                                                                                                                     // 22
});                                                                                                                  // 23
                                                                                                                     // 24
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/telescope-post-files/common/extend.js                                                                    //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
                                                                                                                     // 1
PostUrl = function(f) {                                                                                              // 2
    if (f.post)                                                                                                      // 3
        return "/posts/" + f.post + "/file/" + f.name();                                                             // 4
    else                                                                                                             // 5
        return "/posts/" + f.owner  + "/file/" + f.name();                                                           // 6
}                                                                                                                    // 7
                                                                                                                     // 8
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-post-files'] = {
  preloadSubscriptions: preloadSubscriptions,
  adminNav: adminNav,
  Categories: Categories,
  addToPostSchema: addToPostSchema,
  primaryNav: primaryNav,
  postModules: postModules,
  Collections: Collections,
  AutoForm: AutoForm,
  FS: FS
};

})();

//# sourceMappingURL=telescope-post-files.js.map
