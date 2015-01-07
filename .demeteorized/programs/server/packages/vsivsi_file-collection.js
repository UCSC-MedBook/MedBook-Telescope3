(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;

/* Package-scope variables */
var FileCollection, __coffeescriptShare;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/vsivsi:file-collection/gridFS.coffee.js                                                         //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
share.defaultChunkSize = 2 * 1024 * 1024;

share.defaultRoot = 'fs';

share.insert_func = function(file, chunkSize) {
  var id, subFile, _ref, _ref1, _ref2, _ref3;
  if (file == null) {
    file = {};
  }
  try {
    id = new Meteor.Collection.ObjectID("" + file._id);
  } catch (_error) {
    id = new Meteor.Collection.ObjectID();
  }
  subFile = {};
  subFile._id = id;
  subFile.length = 0;
  subFile.md5 = 'd41d8cd98f00b204e9800998ecf8427e';
  subFile.uploadDate = new Date();
  subFile.chunkSize = chunkSize;
  subFile.filename = (_ref = file.filename) != null ? _ref : '';
  subFile.metadata = (_ref1 = file.metadata) != null ? _ref1 : {};
  subFile.aliases = (_ref2 = file.aliases) != null ? _ref2 : [];
  subFile.contentType = (_ref3 = file.contentType) != null ? _ref3 : 'application/octet-stream';
  return subFile;
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/vsivsi:file-collection/server_shared.coffee.js                                                  //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
if (Meteor.isServer) {
  share.check_allow_deny = function(type, userId, file, fields) {
    var checkRules, result;
    checkRules = function(rules) {
      var func, res, _i, _len, _ref;
      res = false;
      _ref = rules[type];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        func = _ref[_i];
        if (!res) {
          res = func(userId, file, fields);
        }
      }
      return res;
    };
    result = !checkRules(this.denys) && checkRules(this.allows);
    return result;
  };
  share.bind_env = function(func) {
    if (func != null) {
      return Meteor.bindEnvironment(func, function(err) {
        throw err;
      });
    } else {
      return func;
    }
  };
  share.find_mime_boundary = function(req) {
    var RE_BOUNDARY, result;
    RE_BOUNDARY = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i;
    result = RE_BOUNDARY.exec(req.headers['content-type']);
    return (result != null ? result[1] : void 0) || (result != null ? result[2] : void 0);
  };
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/vsivsi:file-collection/gridFS_server.coffee.js                                                  //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var dicer, express, fs, grid, gridLocks, mongodb, path, reject_file_modifier,                
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (Meteor.isServer) {
  mongodb = Npm.require('mongodb');
  grid = Npm.require('gridfs-locking-stream');
  gridLocks = Npm.require('gridfs-locks');
  fs = Npm.require('fs');
  path = Npm.require('path');
  dicer = Npm.require('dicer');
  express = Npm.require('express');
  FileCollection = (function(_super) {
    __extends(FileCollection, _super);

    function FileCollection(root, options) {
      var _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      this.root = root != null ? root : share.defaultRoot;
      if (options == null) {
        options = {};
      }
      if (!(this instanceof FileCollection)) {
        return new FileCollection(this.root, options);
      }
      if (typeof this.root === 'object') {
        options = this.root;
        this.root = share.defaultRoot;
      }
      this.chunkSize = (_ref = options.chunkSize) != null ? _ref : share.defaultChunkSize;
      this.db = Meteor._wrapAsync(mongodb.MongoClient.connect)(process.env.MONGO_URL, {});
      this.lockOptions = {
        timeOut: (_ref1 = (_ref2 = options.locks) != null ? _ref2.timeOut : void 0) != null ? _ref1 : 360,
        lockExpiration: (_ref3 = (_ref4 = options.locks) != null ? _ref4.lockExpiration : void 0) != null ? _ref3 : 90,
        pollingInterval: (_ref5 = (_ref6 = options.locks) != null ? _ref6.pollingInterval : void 0) != null ? _ref5 : 5
      };
      this.locks = gridLocks.LockCollection(this.db, {
        root: this.root,
        timeOut: this.lockOptions.timeOut,
        lockExpiration: this.lockOptions.lockExpiration,
        pollingInterval: this.lockOptions.pollingInterval
      });
      this.gfs = new grid(this.db, mongodb, this.root);
      this.baseURL = (_ref7 = options.baseURL) != null ? _ref7 : "/gridfs/" + this.root;
      if (options.resumable || options.http) {
        share.setupHttpAccess.bind(this)(options);
      }
      this.allows = {
        read: [],
        insert: [],
        write: [],
        remove: []
      };
      this.denys = {
        read: [],
        insert: [],
        write: [],
        remove: []
      };
      FileCollection.__super__.constructor.call(this, this.root + '.files', {
        idGeneration: 'MONGO'
      });
      FileCollection.__super__.allow.bind(this)({
        insert: (function(_this) {
          return function(userId, file) {
            return true;
          };
        })(this),
        remove: (function(_this) {
          return function(userId, file) {
            return true;
          };
        })(this)
      });
      FileCollection.__super__.deny.bind(this)({
        insert: (function(_this) {
          return function(userId, file) {
            check(file, {
              _id: Meteor.Collection.ObjectID,
              length: Match.Where(function(x) {
                check(x, Match.Integer);
                return x === 0;
              }),
              md5: Match.Where(function(x) {
                check(x, String);
                return x === 'd41d8cd98f00b204e9800998ecf8427e';
              }),
              uploadDate: Date,
              chunkSize: Match.Where(function(x) {
                check(x, Match.Integer);
                return x === _this.chunkSize;
              }),
              filename: String,
              contentType: String,
              aliases: [String],
              metadata: Object
            });
            if (file.chunkSize !== _this.chunkSize) {
              console.warn("Invalid chunksize");
              return true;
            }
            if (share.check_allow_deny.bind(_this)('insert', userId, file)) {
              return false;
            }
            return true;
          };
        })(this),
        update: (function(_this) {
          return function(userId, file, fields) {
            return true;
          };
        })(this),
        remove: (function(_this) {
          return function(userId, file) {
            if (share.check_allow_deny.bind(_this)('remove', userId, file)) {
              _this.remove(file);
              return false;
            }
            return true;
          };
        })(this)
      });
    }

    FileCollection.prototype.allow = function(allowOptions) {
      var func, type, _results;
      _results = [];
      for (type in allowOptions) {
        func = allowOptions[type];
        if (!(type in this.allows)) {
          throw new Error("Unrecognized allow rule type '" + type + "'.");
        }
        if (typeof func !== 'function') {
          throw new Error("Allow rule " + type + " must be a valid function.");
        }
        _results.push(this.allows[type].push(func));
      }
      return _results;
    };

    FileCollection.prototype.deny = function(denyOptions) {
      var func, type, _results;
      _results = [];
      for (type in denyOptions) {
        func = denyOptions[type];
        if (!(type in this.denys)) {
          throw new Error("Unrecognized deny rule type '" + type + "'.");
        }
        if (typeof func !== 'function') {
          throw new Error("Deny rule " + type + " must be a valid function.");
        }
        _results.push(this.denys[type].push(func));
      }
      return _results;
    };

    FileCollection.prototype.insert = function(file, callback) {
      if (file == null) {
        file = {};
      }
      if (callback == null) {
        callback = void 0;
      }
      file = share.insert_func(file, this.chunkSize);
      return FileCollection.__super__.insert.call(this, file, callback);
    };

    FileCollection.prototype.update = function(selector, modifier, options, callback) {
      var err;
      if (options == null) {
        options = {};
      }
      if (callback == null) {
        callback = void 0;
      }
      if ((callback == null) && typeof options === 'function') {
        callback = options;
        options = {};
      }
      if (options.upsert != null) {
        err = new Error("Update does not support the upsert option");
        if (callback != null) {
          return callback(err);
        } else {
          throw err;
        }
      }
      if (reject_file_modifier(modifier) && !options.force) {
        err = new Error("Modifying gridFS read-only document elements is a very bad idea!");
        if (callback != null) {
          return callback(err);
        } else {
          throw err;
        }
      } else {
        return FileCollection.__super__.update.call(this, selector, modifier, options, callback);
      }
    };

    FileCollection.prototype.upsert = function(selector, modifier, options, callback) {
      var err;
      if (options == null) {
        options = {};
      }
      if (callback == null) {
        callback = void 0;
      }
      if ((callback == null) && typeof options === 'function') {
        callback = options;
      }
      err = new Error("File Collections do not support 'upsert'");
      if (callback != null) {
        return callback(err);
      } else {
        throw new Error("File Collections do not support 'upsert'");
      }
    };

    FileCollection.prototype.upsertStream = function(file, options, callback) {
      var cbCalled, found, mods, writeStream, _ref;
      if (options == null) {
        options = {};
      }
      if (callback == null) {
        callback = void 0;
      }
      if ((callback == null) && typeof options === 'function') {
        callback = options;
        options = {};
      }
      if (!(options.mode === 'w' || options.mode === 'w+')) {
        options.mode = 'w';
      }
      callback = share.bind_env(callback);
      cbCalled = false;
      mods = {};
      if (file.filename != null) {
        mods.filename = file.filename;
      }
      if (file.aliases != null) {
        mods.aliases = file.aliases;
      }
      if (file.contentType != null) {
        mods.contentType = file.contentType;
      }
      if (file.metadata != null) {
        mods.metadata = file.metadata;
      }
      if (file._id) {
        found = this.findOne({
          _id: file._id
        });
      }
      if (!(file._id && found)) {
        file._id = this.insert(mods);
      } else {
        this.update({
          _id: file._id
        }, {
          $set: mods
        });
      }
      writeStream = Meteor._wrapAsync(this.gfs.createWriteStream.bind(this.gfs))({
        root: this.root,
        _id: mongodb.ObjectID("" + file._id),
        mode: (_ref = options.mode) != null ? _ref : 'w',
        timeOut: this.lockOptions.timeOut,
        lockExpiration: this.lockOptions.lockExpiration,
        pollingInterval: this.lockOptions.pollingInterval
      });
      if (callback != null) {
        writeStream.on('close', function(retFile) {
          if (retFile) {
            return callback(null, retFile);
          }
        });
        writeStream.on('error', function(err) {
          return callback(err);
        });
      }
      return writeStream;
    };

    FileCollection.prototype.findOneStream = function(selector, options, callback) {
      var file, opts, readStream;
      if (options == null) {
        options = {};
      }
      if (callback == null) {
        callback = void 0;
      }
      if ((callback == null) && typeof options === 'function') {
        callback = options;
        options = {};
      }
      callback = share.bind_env(callback);
      opts = {};
      if (options.sort != null) {
        opts.sort = options.sort;
      }
      if (options.skip != null) {
        opts.skip = options.skip;
      }
      file = this.findOne(selector, opts);
      if (file) {
        readStream = Meteor._wrapAsync(this.gfs.createReadStream.bind(this.gfs))({
          root: this.root,
          _id: mongodb.ObjectID("" + file._id),
          timeOut: this.lockOptions.timeOut,
          lockExpiration: this.lockOptions.lockExpiration,
          pollingInterval: this.lockOptions.pollingInterval
        });
        if (callback != null) {
          readStream.on('close', function() {
            return callback(null, file);
          });
          readStream.on('error', function(err) {
            return callback(err);
          });
        }
        return readStream;
      } else {
        return null;
      }
    };

    FileCollection.prototype.remove = function(selector, callback) {
      if (callback == null) {
        callback = void 0;
      }
      callback = share.bind_env(callback);
      if (selector != null) {
        this.find(selector).forEach((function(_this) {
          return function(file) {
            var ret;
            return ret = Meteor._wrapAsync(_this.gfs.remove.bind(_this.gfs))({
              _id: mongodb.ObjectID("" + file._id),
              root: _this.root
            });
          };
        })(this));
        return (callback != null) && callback(null, ret);
      } else {
        return (callback != null) && callback(new Error("Remove with an empty selector is not supported"));
      }
    };

    FileCollection.prototype.importFile = function(filePath, file, callback) {
      var readStream, writeStream;
      callback = share.bind_env(callback);
      filePath = path.normalize(filePath);
      if (file == null) {
        file = {};
      }
      if (file.filename == null) {
        file.filename = path.basename(filePath);
      }
      readStream = fs.createReadStream(filePath);
      writeStream = this.upsertStream(file);
      return readStream.pipe(writeStream).on('close', share.bind_env(function(d) {
        return callback(null, d);
      })).on('error', share.bind_env(callback));
    };

    FileCollection.prototype.exportFile = function(selector, filePath, callback) {
      var readStream, writeStream;
      callback = share.bind_env(callback);
      filePath = path.normalize(filePath);
      readStream = this.findOneStream(selector);
      writeStream = fs.createWriteStream(filePath);
      return readStream.pipe(writeStream).on('finish', share.bind_env(callback)).on('error', share.bind_env(callback));
    };

    return FileCollection;

  })(Meteor.Collection);
  reject_file_modifier = function(modifier) {
    var forbidden, required;
    forbidden = Match.OneOf(Match.ObjectIncluding({
      _id: Match.Any
    }), Match.ObjectIncluding({
      length: Match.Any
    }), Match.ObjectIncluding({
      chunkSize: Match.Any
    }), Match.ObjectIncluding({
      md5: Match.Any
    }), Match.ObjectIncluding({
      uploadDate: Match.Any
    }));
    required = Match.OneOf(Match.ObjectIncluding({
      _id: Match.Any
    }), Match.ObjectIncluding({
      length: Match.Any
    }), Match.ObjectIncluding({
      chunkSize: Match.Any
    }), Match.ObjectIncluding({
      md5: Match.Any
    }), Match.ObjectIncluding({
      uploadDate: Match.Any
    }), Match.ObjectIncluding({
      metadata: Match.Any
    }), Match.ObjectIncluding({
      aliases: Match.Any
    }), Match.ObjectIncluding({
      filename: Match.Any
    }), Match.ObjectIncluding({
      contentType: Match.Any
    }));
    return Match.test(modifier, Match.OneOf(Match.ObjectIncluding({
      $set: forbidden
    }), Match.ObjectIncluding({
      $unset: required
    }), Match.ObjectIncluding({
      $inc: forbidden
    }), Match.ObjectIncluding({
      $mul: forbidden
    }), Match.ObjectIncluding({
      $bit: forbidden
    }), Match.ObjectIncluding({
      $min: forbidden
    }), Match.ObjectIncluding({
      $max: forbidden
    }), Match.ObjectIncluding({
      $rename: required
    }), Match.ObjectIncluding({
      $currentDate: forbidden
    })));
  };
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/vsivsi:file-collection/resumable_server.coffee.js                                               //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var async, check_order, dice_resumable_multipart, dicer, express, grid, gridLocks, mongodb, resumable_get, resumable_post;

if (Meteor.isServer) {
  express = Npm.require('express');
  mongodb = Npm.require('mongodb');
  grid = Npm.require('gridfs-locking-stream');
  gridLocks = Npm.require('gridfs-locks');
  dicer = Npm.require('dicer');
  async = Npm.require('async');
  check_order = function(file, callback) {
    var fileId, lock;
    fileId = mongodb.ObjectID("" + file.metadata._Resumable.resumableIdentifier);
    lock = gridLocks.Lock(fileId, this.locks, {}).obtainWriteLock();
    lock.on('locked', (function(_this) {
      return function() {
        var files;
        files = _this.db.collection("" + _this.root + ".files");
        return files.find({
          'metadata._Resumable.resumableIdentifier': file.metadata._Resumable.resumableIdentifier
        }, {
          sort: {
            'metadata._Resumable.resumableChunkNumber': 1
          }
        }).toArray(function(err, parts) {
          var chunks, goodParts, lastPart, totalSize;
          if (err) {
            return callback(err);
          }
          if (!(parts.length >= 1)) {
            return lock.releaseLock();
          }
          lastPart = 0;
          goodParts = parts.filter(function(el) {
            var l, _ref, _ref1;
            l = lastPart;
            lastPart = (_ref = el.metadata) != null ? _ref._Resumable.resumableChunkNumber : void 0;
            return el.length === ((_ref1 = el.metadata) != null ? _ref1._Resumable.resumableCurrentChunkSize : void 0) && lastPart === l + 1;
          });
          if (goodParts.length !== goodParts[0].metadata._Resumable.resumableTotalChunks) {
            return lock.releaseLock();
          }
          chunks = _this.db.collection("" + _this.root + ".chunks");
          totalSize = goodParts[0].metadata._Resumable.resumableTotalSize;
          return async.eachLimit(goodParts, 3, function(part, cb) {
            var partId, partlock;
            partId = mongodb.ObjectID("" + part._id);
            partlock = gridLocks.Lock(partId, _this.locks, {}).obtainWriteLock();
            partlock.on('locked', function() {
              return async.series([
                function(cb) {
                  return chunks.update({
                    files_id: partId,
                    n: 0
                  }, {
                    $set: {
                      files_id: fileId,
                      n: part.metadata._Resumable.resumableChunkNumber - 1
                    }
                  }, cb);
                }, function(cb) {
                  return files.remove({
                    _id: partId
                  }, cb);
                }
              ], (function(_this) {
                return function(err, res) {
                  if (err) {
                    return cb(err);
                  }
                  if (part.metadata._Resumable.resumableChunkNumber !== part.metadata._Resumable.resumableTotalChunks) {
                    partlock.removeLock();
                    return cb();
                  } else {
                    return chunks.update({
                      files_id: partId,
                      n: 1
                    }, {
                      $set: {
                        files_id: fileId,
                        n: part.metadata._Resumable.resumableChunkNumber
                      }
                    }, function(err, res) {
                      if (err) {
                        return cb(err);
                      }
                      partlock.removeLock();
                      return cb();
                    });
                  }
                };
              })(this));
            });
            partlock.on('timed-out', function() {
              return callback(new Error('Partlock timed out!'));
            });
            return partlock.on('error', function(err) {
              return callback(error);
            });
          }, function(err) {
            if (err) {
              return callback(err);
            }
            return files.update({
              _id: fileId
            }, {
              $set: {
                length: totalSize
              }
            }, function(err, res) {
              if (err) {
                return callback(err);
              }
              lock.releaseLock();
              return _this.gfs.createWriteStream({
                _id: fileId,
                filename: file.metadata._Resumable.resumableFilename
              }, function(err, stream) {
                if (err) {
                  return callback(err);
                }
                stream.write('');
                return stream.end();
              });
            });
          });
        });
      };
    })(this));
    return lock.on('timed-out', function() {
      throw "File Lock timed out";
    });
  };
  dice_resumable_multipart = function(req, callback) {
    var boundary, d, err, fileStream, resCount, resumable;
    callback = share.bind_env(callback);
    boundary = share.find_mime_boundary(req);
    if (!boundary) {
      console.error('No MIME multipart boundary found for dicer');
      err = new Error('No MIME multipart boundary found for dicer');
      return callback(err);
    }
    resumable = {};
    resCount = 0;
    fileStream = null;
    d = new dicer({
      boundary: boundary
    });
    d.on('part', function(p) {
      return p.on('header', function(header) {
        var RE_FILE, RE_NUMBER, RE_RESUMABLE, k, resData, resVar, v, _ref, _results;
        RE_RESUMABLE = /^form-data; name="(resumable[^"]+)"/;
        RE_FILE = /^form-data; name="file"; filename="blob"/;
        RE_NUMBER = /Size|Chunk/;
        _results = [];
        for (k in header) {
          v = header[k];
          if (k === 'content-disposition') {
            if (resVar = (_ref = RE_RESUMABLE.exec(v)) != null ? _ref[1] : void 0) {
              resData = '';
              resCount++;
              p.on('data', function(data) {
                return resData += data.toString();
              });
              p.on('end', function() {
                resCount--;
                if (!RE_NUMBER.test(resVar)) {
                  resumable[resVar] = resData;
                } else {
                  resumable[resVar] = parseInt(resData);
                }
                if (resCount === 0 && fileStream) {
                  return callback(null, resumable, fileStream);
                }
              });
              _results.push(p.on('error', function(err) {
                console.error('Error in Dicer while streaming: \n', err);
                return callback(err);
              }));
            } else if (RE_FILE.exec(v)) {
              fileStream = p;
              if (resCount === 0) {
                _results.push(callback(null, resumable, fileStream));
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    });
    d.on('error', function(err) {
      console.error('Error in Dicer: \n', err);
      return callback(err);
    });
    d.on('finish', function() {
      if (!fileStream) {
        return callback(new Error("No file blob in multipart POST"));
      }
    });
    return req.pipe(d);
  };
  resumable_post = function(req, res, next) {
    return dice_resumable_multipart.bind(this)(req, (function(_this) {
      return function(err, resumable, fileStream) {
        var ID, file, writeStream;
        if (err) {
          res.writeHead(500);
          res.end();
        } else {
          if (!resumable) {
            res.writeHead(501);
            res.end();
            return;
          }
          try {
            ID = new Meteor.Collection.ObjectID(resumable.resumableIdentifier);
          } catch (_error) {
            res.writeHead(501);
            res.end();
            return;
          }
          file = _this.findOne({
            _id: ID
          });
          if (!file) {
            res.writeHead(404);
            res.end();
            return;
          }
          if (!share.check_allow_deny.bind(_this)('write', req.meteorUserId, file, ['length', 'md5'])) {
            res.writeHead(404);
            res.end();
            return;
          }
          if (!((file.chunkSize === resumable.resumableChunkSize) && (resumable.resumableCurrentChunkSize === resumable.resumableChunkSize) || ((resumable.resumableChunkNumber === resumable.resumableTotalChunks) && (resumable.resumableCurrentChunkSize < 2 * resumable.resumableChunkSize)))) {
            res.writeHead(501);
            res.end();
            return;
          }
          file.metadata._Resumable = resumable;
          writeStream = _this.upsertStream({
            filename: "_Resumable_" + resumable.resumableIdentifier + "_" + resumable.resumableChunkNumber + "_" + resumable.resumableTotalChunks,
            metadata: file.metadata
          });
          if (!writeStream) {
            res.writeHead(404);
            res.end();
            return;
          }
          return fileStream.pipe(writeStream).on('close', share.bind_env(function(retFile) {
            if (retFile) {
              res.writeHead(200);
              res.end();
              return check_order.bind(_this)(file, function(err) {
                return console.error("Error reassembling chunks of resumable.js upload", err);
              });
            }
          })).on('error', share.bind_env(function(err) {
            console.error("Piping Error!", err);
            res.writeHead(500);
            return res.end();
          }));
        }
      };
    })(this));
  };
  resumable_get = function(req, res, next) {
    var file;
    file = this.findOne({
      $or: [
        {
          _id: req.query.resumableIdentifier,
          length: req.query.resumableTotalSize
        }, {
          length: req.query.resumableCurrentChunkSize,
          'metadata._Resumable.resumableIdentifier': req.query.resumableIdentifier,
          'metadata._Resumable.resumableChunkNumber': req.query.resumableChunkNumber
        }
      ]
    });
    if (!file) {
      res.writeHead(404);
      res.end();
      return;
    }
    if (!share.check_allow_deny.bind(this)('write', req.meteorUserId, file, ['length', 'md5'])) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200);
    return res.end();
  };
  share.setup_resumable = function() {
    var r;
    r = express.Router();
    r.route('/_resumable').get(resumable_get.bind(this)).post(resumable_post.bind(this)).all(function(req, res, next) {
      res.writeHead(500);
      return res.end();
    });
    return WebApp.rawConnectHandlers.use(this.baseURL, share.bind_env(r));
  };
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/vsivsi:file-collection/http_access_server.coffee.js                                             //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
var build_access_point, cookieParser, del, dice_multipart, dicer, express, get, grid, gridLocks, handle_auth, lookup_userId_by_token, mongodb, post, put, tokenWarning;

if (Meteor.isServer) {
  express = Npm.require('express');
  cookieParser = Npm.require('cookie-parser');
  mongodb = Npm.require('mongodb');
  grid = Npm.require('gridfs-locking-stream');
  gridLocks = Npm.require('gridfs-locks');
  dicer = Npm.require('dicer');
  dice_multipart = function(req, callback) {
    var boundary, d, err, fileStream;
    callback = share.bind_env(callback);
    boundary = share.find_mime_boundary(req);
    if (!boundary) {
      err = new Error('No MIME multipart boundary found for dicer');
      return callback(err);
    }
    fileStream = null;
    d = new dicer({
      boundary: boundary
    });
    d.on('part', function(p) {
      return p.on('header', function(header) {
        var RE_FILE, fn, ft, k, re, v;
        RE_FILE = /^form-data; name="file"; filename="([^"]+)"/;
        for (k in header) {
          v = header[k];
          if (k === 'content-type') {
            ft = v;
          }
          if (k === 'content-disposition') {
            if (re = RE_FILE.exec(v)) {
              fileStream = p;
              fn = re[1];
            }
          }
        }
        return callback(null, fileStream, fn, ft);
      });
    });
    d.on('error', function(err) {
      return callback(err);
    });
    d.on('finish', function() {
      if (!fileStream) {
        return callback(new Error("No file in multipart POST"));
      }
    });
    return req.pipe(d);
  };
  post = function(req, res, next) {
    return dice_multipart(req, (function(_this) {
      return function(err, fileStream, filename, filetype) {
        var stream;
        if (err) {
          console.warn('Error parsing POST body', err);
          res.writeHead(500);
          res.end();
          return;
        }
        if (filetype) {
          req.gridFS.contentType = filetype;
        }
        if (filename) {
          req.gridFS.filename = filename;
        }
        stream = _this.upsertStream(req.gridFS);
        if (stream) {
          return fileStream.pipe(stream).on('close', function(retFile) {
            if (retFile) {
              res.writeHead(200);
              return res.end();
            }
          }).on('error', function(err) {
            res.writeHead(500);
            return res.end();
          });
        } else {
          res.writeHead(410);
          return res.end();
        }
      };
    })(this));
  };
  get = function(req, res, next) {
    var filename, headers, stream, _ref;
    headers = {
      'Content-type': req.gridFS.contentType,
      'Content-MD5': req.gridFS.md5,
      'Content-Length': req.gridFS.length,
      'Last-Modified': req.gridFS.uploadDate.toUTCString()
    };
    if (req.query.download || req.query.filename) {
      filename = (_ref = req.query.filename) != null ? _ref : req.gridFS.filename;
      headers['Content-Disposition'] = "attachment; filename=\"" + filename + "\"";
    }
    if (req.method === 'HEAD') {
      res.writeHead(204, headers);
      res.end();
      return;
    }
    stream = this.findOneStream({
      _id: req.gridFS._id
    });
    if (stream) {
      res.writeHead(200, headers);
      return stream.pipe(res).on('close', function() {
        return res.end();
      }).on('error', function(err) {
        res.writeHead(500);
        return res.end(err);
      });
    } else {
      res.writeHead(410);
      return res.end();
    }
  };
  put = function(req, res, next) {
    var stream;
    if (req.headers['content-type']) {
      req.gridFS.contentType = req.headers['content-type'];
    }
    stream = this.upsertStream(req.gridFS);
    if (stream) {
      return req.pipe(stream).on('close', function(retFile) {
        if (retFile) {
          res.writeHead(200);
          return res.end();
        }
      }).on('error', function(err) {
        res.writeHead(500);
        return res.end(err);
      });
    } else {
      res.writeHead(404);
      return res.end("" + req.url + " Not found!");
    }
  };
  del = function(req, res, next) {
    this.remove(req.gridFS);
    res.writeHead(204);
    return res.end();
  };
  build_access_point = function(http) {
    var r, _i, _len;
    for (_i = 0, _len = http.length; _i < _len; _i++) {
      r = http[_i];
      this.router[r.method](r.path, (function(_this) {
        return function(r) {
          var getDep;
          getDep = true;
          return function(req, res, next) {
            var lookup, safeObjectID, _ref, _ref1;
            safeObjectID = function(s) {
              if (s.match(/^[0-9a-f]{24}$/i)) {
                return new Meteor.Collection.ObjectID(s);
              } else {
                return null;
              }
            };
            if (((_ref = req.params) != null ? _ref._id : void 0) != null) {
              req.params._id = safeObjectID(req.params._id);
            }
            if (((_ref1 = req.query) != null ? _ref1._id : void 0) != null) {
              req.query._id = safeObjectID(req.query._id);
            }
            lookup = typeof r.lookup === "function" ? r.lookup(req.params || {}, req.query || {}) : void 0;
            if (lookup == null) {
              res.writeHead(500);
              res.end();
            } else {
              req.gridFS = _this.findOne(lookup);
              if (!req.gridFS) {
                res.writeHead(404);
                res.end();
                return;
              }
              switch (req.method) {
                case 'HEAD':
                case 'GET':
                  if (!share.check_allow_deny.bind(_this)('read', req.meteorUserId, req.gridFS)) {
                    res.writeHead(403);
                    res.end();
                    return;
                  }
                  break;
                case 'POST':
                case 'PUT':
                  if (!share.check_allow_deny.bind(_this)('write', req.meteorUserId, req.gridFS)) {
                    res.writeHead(403);
                    res.end();
                    return;
                  }
                  break;
                case 'DELETE':
                  if (!share.check_allow_deny.bind(_this)('remove', req.meteorUserId, req.gridFS)) {
                    res.writeHead(403);
                    res.end();
                    return;
                  }
                  break;
                default:
                  res.writeHead(500);
                  res.end();
                  return;
              }
              return next();
            }
          };
        };
      })(this)(r));
    }
    return this.router.route('/*').all(function(req, res, next) {
      if (!req.gridFS) {
        res.writeHead(404);
        res.end();
        return;
      }
      return next();
    }).head(get.bind(this)).get(get.bind(this)).put(put.bind(this)).post(post.bind(this))["delete"](del.bind(this)).all(function(req, res, next) {
      res.writeHead(500);
      return res.end();
    });
  };
  lookup_userId_by_token = function(authToken) {
    var userDoc, _ref;
    userDoc = (_ref = Meteor.users) != null ? _ref.findOne({
      'services.resume.loginTokens': {
        $elemMatch: {
          hashedToken: typeof Accounts !== "undefined" && Accounts !== null ? Accounts._hashLoginToken(authToken) : void 0
        }
      }
    }) : void 0;
    return (userDoc != null ? userDoc._id : void 0) || null;
  };
  tokenWarning = false;
  handle_auth = function(req, res, next) {
    var _ref, _ref1;
    if (req.meteorUserId == null) {
      if (((_ref = req.headers) != null ? _ref['x-auth-token'] : void 0) != null) {
        req.meteorUserId = lookup_userId_by_token(req.headers['x-auth-token']);
      } else if (((_ref1 = req.cookies) != null ? _ref1['X-Auth-Token'] : void 0) != null) {
        req.meteorUserId = lookup_userId_by_token(req.cookies['X-Auth-Token']);
      }
    }
    return next();
  };
  share.setupHttpAccess = function(options) {
    var r;
    r = express.Router();
    r.use(express.query());
    r.use(cookieParser());
    r.use(handle_auth);
    WebApp.rawConnectHandlers.use(this.baseURL, share.bind_env(r));
    if (options.resumable) {
      share.setup_resumable.bind(this)();
    }
    this.router = express.Router();
    build_access_point.bind(this)(options.http, this.router);
    return WebApp.rawConnectHandlers.use(this.baseURL, share.bind_env(this.router));
  };
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['vsivsi:file-collection'] = {
  FileCollection: FileCollection
};

})();

//# sourceMappingURL=vsivsi_file-collection.js.map
