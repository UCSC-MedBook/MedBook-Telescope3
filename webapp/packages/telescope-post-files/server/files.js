
Meteor.startup(function () {

  // My auth will return the userId
  var myAuth = function() {
        // Read the token from '/hello?token=5'
        var userToken = this.query.token;
        // Check the userToken before adding it to the db query
        // Set the this.userId
        if (userToken) {
          var user = Meteor.users.findOne({ 'services.resume.loginTokens.token': userToken });

          // Set the userId in the scope
          return user && user._id;
        }  
      };

    function readCookie(cookieHeader, cookieName) {
     var re = new RegExp('[; ]'+cookieName+'=([^\\s;]*)');
     var sMatch = (' '+cookieHeader).match(re);
     if (cookieName && sMatch) return unescape(sMatch[1]);
     return  null;
    }

    function auth() {
        var meteor_login_token = this.req.cookies.meteor_login_token;
        if (meteor_login_token) {
             var user = Meteor.users.findOne({"services.resume.loginTokens.hashedToken": Accounts._hashLoginToken(meteor_login_token)});
             if (user)
                 return user._id;
        }
        return null;
    }

//copied from Meteor-cfs-access-point


/**
 * @method defaultSelectorFunction
 * @private
 * @returns { collection, file }
 *
 * This is the default selector function
 */
var defaultSelectorFunction = function() {
  var self = this;
  // Selector function
  //
  // This function will have to return the collection and the
  // file. If file not found undefined is returned - if null is returned the
  // search was not possible
  var opts = FS.Utility.extend({}, self.query || {}, self.params || {});

  // Get the collection name from the url
  var collectionName = "blobs";

  // Get the id from the url
  var id = opts.id;

  // Get the collection
  var collection = FS._collections[collectionName];

  // Get the file if possible else return null
  var q = ({post: this.params.postId, 'original.name': this.params.name});
  var file =  Collections.Blobs.findOne(q);

  if (file == null) {
      q = ({owner: this.params.postId, 'original.name': this.params.name});
      file =  Collections.Blobs.findOne(q);
  }

  // Return the collection and the file
  return {
    collection: collection,
    file: file,
    storeName: opts.store,
    download: opts.download,
    filename: opts.filename
  };
};

/*
  requestRange will parse the range set in request header - if not possible it
  will throw fitting errors and autofill range for both partial and full ranges
  throws error or returns the object:
  {
    start
    end
    length
    unit
    partial
  }
*/
var requestRange = function(req, fileSize) {
  if (req) {
    if (req.headers) {
      var rangeString = req.headers.range;

      // Make sure range is a string
      if (rangeString === ''+rangeString) {

        // range will be in the format "bytes=0-32767"
        var parts = rangeString.split('=');
        var unit = parts[0];

        // Make sure parts consists of two strings and range is of type "byte"
        if (parts.length == 2 && unit == 'bytes') {
          // Parse the range
          var range = parts[1].split('-');
          var start = Number(range[0]);
          var end = Number(range[1]);

          // Fix invalid ranges?
          if (range[0] != start) start = 0;
          if (range[1] != end) end = fileSize - 1;

          // Make sure range consists of a start and end point of numbers and start is less than end
          if (start < end) {

            var partSize = start + end + 1;

            // Return the parsed range
            return {
              start: start,
              end: end,
              length: partSize,
              size: fileSize,
              unit: unit,
              partial: (partSize < fileSize)
            };

          } else {
            throw new Meteor.Error(416, "Requested Range Not Satisfiable");
          }

        } else {
          // The first part should be bytes
          throw new Meteor.Error(416, "Requested Range Unit Not Satisfiable");
        }

      } else {
        // No range found
      }

    } else {
      // throw new Error('No request headers set for _parseRange function');
    }
  } else {
    throw new Error('No request object passed to _parseRange function');
  }

  return {
    start: 0,
    end: fileSize - 1,
    length: fileSize,
    size: fileSize,
    unit: 'bytes',
    partial: false
  };
};




getHeaders = [];
getHeadersByCollection = {};

/**
 * @method httpDelHandler
 * @private
 * @returns {any} response
 *
 * HTTP DEL request handler
 */
httpDelHandler = function httpDelHandler(ref) {
  var self = this;
  var opts = FS.Utility.extend({}, self.query || {}, self.params || {});

  // If DELETE request, validate with 'remove' allow/deny, delete the file, and return
  FS.Utility.validateAction(ref.collection.files._validators['remove'], ref.file, self.userId);

  /*
   * From the DELETE spec:
   * A successful response SHOULD be 200 (OK) if the response includes an
   * entity describing the status, 202 (Accepted) if the action has not
   * yet been enacted, or 204 (No Content) if the action has been enacted
   * but the response does not include an entity.
   */
  self.setStatusCode(200);

  return {
    deleted: !!ref.file.remove()
  };
};

/*
  requestRange will parse the range set in request header - if not possible it
  will throw fitting errors and autofill range for both partial and full ranges
  throws error or returns the object:
  {
    start
    end
    length
    unit
    partial
  }
*/
var requestRange = function(req, fileSize) {
  if (req) {
    if (req.headers) {
      var rangeString = req.headers.range;

      // Make sure range is a string
      if (rangeString === ''+rangeString) {

        // range will be in the format "bytes=0-32767"
        var parts = rangeString.split('=');
        var unit = parts[0];

        // Make sure parts consists of two strings and range is of type "byte"
        if (parts.length == 2 && unit == 'bytes') {
          // Parse the range
          var range = parts[1].split('-');
          var start = Number(range[0]);
          var end = Number(range[1]);

          // Fix invalid ranges?
          if (range[0] != start) start = 0;
          if (range[1] != end) end = fileSize - 1;

          // Make sure range consists of a start and end point of numbers and start is less than end
          if (start < end) {

            var partSize = start + end + 1;

            // Return the parsed range
            return {
              start: start,
              end: end,
              length: partSize,
              size: fileSize,
              unit: unit,
              partial: (partSize < fileSize)
            };

          } else {
            throw new Meteor.Error(416, "Requested Range Not Satisfiable");
          }

        } else {
          // The first part should be bytes
          throw new Meteor.Error(416, "Requested Range Unit Not Satisfiable");
        }

      } else {
        // No range found
      }

    } else {
      // throw new Error('No request headers set for _parseRange function');
    }
  } else {
    throw new Error('No request object passed to _parseRange function');
  }

  return {
    start: 0,
    end: fileSize - 1,
    length: fileSize,
    size: fileSize,
    unit: 'bytes',
    partial: false
  };
};

/**
 * @method httpGetHandler
 * @private
 * @returns {any} response
 *
 * HTTP GET request handler
 */
httpGetHandler = function httpGetHandler(ref) {

 console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");


  var self = this;
  // Once we have the file, we can test allow/deny validators
  // XXX: pass on the "share" query eg. ?share=342hkjh23ggj for shared url access?
  FS.Utility.validateAction(ref.collection._validators['download'], ref.file, self.userId /*, self.query.shareId*/);

  var storeName = ref.storeName;

  // If no storeName was specified, use the first defined storeName
  if (typeof storeName !== "string") {
    // No store handed, we default to primary store
    storeName = ref.collection.primaryStore.name;
  }

  // Get the storage reference
  var storage = ref.collection.storesLookup[storeName];

  if (!storage) {
    throw new Meteor.Error(404, "Not Found", 'There is no store "' + storeName + '"');
  }

  // Get the file
  var copyInfo = ref.file.copies[storeName];

  if (!copyInfo) {
    throw new Meteor.Error(404, "Not Found", 'This file was not stored in the ' + storeName + ' store');
  }

  // Set the content type for file
  if (typeof copyInfo.type === "string") {
    self.setContentType(copyInfo.type);
  } else {
    self.setContentType('application/octet-stream');
  }

  // Add 'Content-Disposition' header if requested a download/attachment URL
  if (typeof ref.download !== "undefined") {
    var filename = ref.filename || copyInfo.name;
    self.addHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
  } else {
    self.addHeader('Content-Disposition', 'inline');
  }

  // Get the contents range from request
  var range = requestRange(self.request, copyInfo.size);

  // Some browsers cope better if the content-range header is
  // still included even for the full file being returned.
  self.addHeader('Content-Range', range.unit + ' ' + range.start + '-' + range.end + '/' + range.size);

  // If a chunk/range was requested instead of the whole file, serve that'
  if (range.partial) {
    self.setStatusCode(206, 'Partial Content');
  } else {
    self.setStatusCode(200, 'OK');
  }

  // Add any other global custom headers and collection-specific custom headers
  FS.Utility.each(getHeaders.concat(getHeadersByCollection[ref.collection.name] || []), function(header) {
    self.addHeader(header[0], header[1]);
  });

  // Inform clients about length (or chunk length in case of ranges)
  self.addHeader('Content-Length', range.length);

  // Last modified header (updatedAt from file info)
  self.addHeader('Last-Modified', copyInfo.updatedAt.toUTCString());

  // Inform clients that we accept ranges for resumable chunked downloads
  //self.addHeader('Accept-Ranges', range.unit);
  self.addHeader('Accept-Ranges', 'none');

  if (FS.debug) console.log('Read file "' + (ref.filename || copyInfo.name) + '" ' + range.unit + ' ' + range.start + '-' + range.end + '/' + range.size);

  var readStream = storage.adapter.createReadStream(ref.file, {start: range.start, end: range.end});

  readStream.on('error', function(err) {
    // Send proper error message on get error
    if (err.message && err.statusCode) {
      self.Error(new Meteor.Error(err.statusCode, err.message));
    } else {
      self.Error(new Meteor.Error(503, 'Service unavailable'));
    }
  });

  readStream.pipe(self.createWriteStream());
};

httpPutInsertHandler = function httpPutInsertHandler(ref) {
  var self = this;
  var opts = FS.Utility.extend({}, self.query || {}, self.params || {});

  FS.debug && console.log("HTTP PUT (insert) handler");

  // Create the nice FS.File
  var fileObj = new FS.File();

  // Set its name
  fileObj.name(opts.filename || null);

  // Attach the readstream as the file's data
  fileObj.attachData(self.createReadStream(), {type: self.requestHeaders['content-type'] || 'application/octet-stream'});

  // Validate with insert allow/deny
  FS.Utility.validateAction(ref.collection.files._validators['insert'], file, self.userId);

  // Insert file into collection, triggering readStream storage
  ref.collection.insert(fileObj);

  // Send response
  self.setStatusCode(200);

  // Return the new file id
  return {_id: fileObj._id};
};



    function get_postFileGetRequest(numArgs) {
        return function postFileGetRequest() {
            console.log("postFileGetRequest");

            if (numArgs == 0) {
              var result ="";
              var postId = this.params.postId;
              Collections.Blobs.find({post: postId}, { sort: {name:1}}).forEach(function(f) {
                  result += "<a target='_blank' href='" + PostUrl(f)  + "'>" +  f.name()+"</a><br>";
              });
              return result;
            } else {
              var name = this.params[''+0]
              for (var i = 1; i < numArgs; i++) {
                 name += "/" + this.params[''+i]
              }
              this.params.name = name;
              var fileRef = defaultSelectorFunction.apply(this);
              console.log("this.request");
              httpGetHandler.call(this, fileRef);
              console.log("get done");
              // return numArgs + ' <b>posts filename username=</b>'+ this.userId;
            }
        }
    }





    var methodParam = {};
    var name =  'posts/:postId/file';

    FS.debug = true;

    for (var numArgs = 0; numArgs <= 100; numArgs ++) {
        methodParam[name] = {  auth: auth, get: get_postFileGetRequest(numArgs)} ;
        name += "/";
        methodParam[name] = {  auth: auth, get: get_postFileGetRequest(numArgs)} ;
        name += ":" + numArgs;
    }

    HTTP.methods(methodParam);

});

            
