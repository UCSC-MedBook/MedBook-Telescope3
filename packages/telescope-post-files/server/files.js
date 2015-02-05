
Meteor.startup(function () {

  // My auth will return the userId
  var myAuth = function() {
        // Read the token from '/hello?token=5'
        var userToken = self.query.token;
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
  console.log(">>>>>>>>>>>> q=", q, " file", file);

  if (file == null) {
      q = ({owner: this.params.postId, 'original.name': this.params.name});
      file =  Collections.Blobs.findOne(q);
      console.log(">>>>>>>>>>>> q=", q, " file", file);
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

/**
 * @method httpGetHandler
 * @private
 * @returns {any} response
 *
 * HTTP GET request handler
 */
httpGetHandler = function httpGetHandler(ref) {
  console.log("ref", ref);
  var self = this;
  // Once we have the file, we can test allow/deny validators
  // XXX: pass on the "share" query eg. ?share=342hkjh23ggj for shared url access?
  // FS.Utility.validateAction(ref.collection._validators['download'], ref.file, self.userId /*, self.query.shareId*/);

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

  var fileType = copyInfo.type;
  var fileSize = copyInfo.size;

  if (typeof fileType === "string") {
    self.setContentType(fileType);
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

  // If a chunk/range was requested instead of the whole file, serve that'
  var start, end, unit, contentLength, readStreamOptions, range = self.requestHeaders.range;
  if (range) {
    // Parse range header
    range = range.split('=');

    unit = range[0];
    if (unit !== 'bytes')
      throw new Meteor.Error(416, "Requested Range Not Satisfiable");

    range = range[1];
    // Spec allows multiple ranges, but we will serve only the first
    range = range.split(',')[0];
    // Get start and end byte positions
    range = range.split('-');
    start = range[0];
    end = range[1] || '';
    // Convert to numbers and adjust invalid values when possible
    start = start.length ? Math.max(Number(start), 0) : 0;
    end = end.length ? Math.min(Number(end), fileSize - 1) : fileSize - 1;
    if (end < start)
      throw new Meteor.Error(416, "Requested Range Not Satisfiable");

    self.addHeader('Content-Range', 'bytes ' + start + '-' + end + '/' + copyInfo.size);
    readStreamOptions = {start: start, end: end};
    end = end + 1; //HTTP end byte is inclusive and ours are not

    // Sets properly content length for range
    contentLength = end - start;
  } else {
    // Content length, defaults to file size
    contentLength = fileSize;
    // Some browsers cope better if the content-range header is
    // still included even for the full file being returned.
    self.addHeader('Content-Range', 'bytes 0-' + (contentLength - 1) + '/' + contentLength);
  }

  if (contentLength < fileSize) {
    self.setStatusCode(206, 'Partial Content');
  } else {
    self.setStatusCode(200, 'OK');
  }

  // Add any other global custom headers and collection-specific custom headers
  /*
  FS.Utility.each(getHeaders.concat(getHeadersByCollection[ref.collection.name] || []), function(header) {
    self.addHeader(header[0], header[1]);
  });
  */

  // Inform clients about length (or chunk length in case of ranges)
  self.addHeader('Content-Length', contentLength);

  // Last modified header (updatedAt from file info)
  self.addHeader('Last-Modified', copyInfo.updatedAt.toUTCString());

  // Inform clients that we accept ranges for resumable chunked downloads
  self.addHeader('Accept-Ranges', 'bytes');

  var readStream = storage.adapter.createReadStream(ref.file, readStreamOptions);

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


    function get_postFileGetRequest(numArgs) {
        return function postFileGetRequest() {
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
              httpGetHandler.call(this, fileRef);
              // return numArgs + ' <b>posts filename username=</b>'+ this.userId;
            }
        }
    }





    var methodParam = {};
    var name =  'posts/:postId/file';

    for (var numArgs = 0; numArgs <= 100; numArgs ++) {
        methodParam[name] = {  auth: auth, get: get_postFileGetRequest(numArgs)} ;
        name += "/";
        methodParam[name] = {  auth: auth, get: get_postFileGetRequest(numArgs)} ;
        name += ":" + numArgs;
    }

    HTTP.methods(methodParam);

});

            
