(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var check = Package.check.check;
var Match = Package.check.Match;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;

/* Package-scope variables */
var SyncedCron, Later;

(function () {

///////////////////////////////////////////////////////////////////////////////////////
//                                                                                   //
// packages/percolatestudio:synced-cron/synced-cron-server.js                        //
//                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////
                                                                                     //
// A package for running jobs synchronized across multiple processes                 // 1
SyncedCron = {                                                                       // 2
  _entries: {},                                                                      // 3
  options: {                                                                         // 4
    //Log job run details to console                                                 // 5
    log: true,                                                                       // 6
                                                                                     // 7
    //Name of collection to use for synchronisation and logging                      // 8
    collectionName: 'cronHistory',                                                   // 9
                                                                                     // 10
    //Default to using localTime                                                     // 11
    utc: false,                                                                      // 12
                                                                                     // 13
    //TTL in seconds for history records in collection to expire                     // 14
    //NOTE: Unset to remove expiry but ensure you remove the index from              // 15
    //mongo by hand                                                                  // 16
    collectionTTL: 172800                                                            // 17
  }                                                                                  // 18
}                                                                                    // 19
                                                                                     // 20
Later = Npm.require('later');                                                        // 21
                                                                                     // 22
Meteor.startup(function() {                                                          // 23
  var options = SyncedCron.options;                                                  // 24
                                                                                     // 25
  // Don't allow TTL less than 5 minutes so we don't break synchronization           // 26
  var minTTL = 300;                                                                  // 27
                                                                                     // 28
  // Use UTC or localtime for evaluating schedules                                   // 29
  if (options.utc)                                                                   // 30
    Later.date.UTC();                                                                // 31
  else                                                                               // 32
    Later.date.localTime();                                                          // 33
                                                                                     // 34
  // collection holding the job history records                                      // 35
  SyncedCron._collection = new Mongo.Collection(options.collectionName);             // 36
  SyncedCron._collection._ensureIndex({intendedAt: 1, name: 1}, {unique: true});     // 37
                                                                                     // 38
  if (options.collectionTTL) {                                                       // 39
    if (options.collectionTTL > minTTL)                                              // 40
      SyncedCron._collection._ensureIndex({startedAt: 1 },                           // 41
        { expireAfterSeconds: options.collectionTTL } );                             // 42
    else                                                                             // 43
      console.log('Warning: Not going to use a TTL that is shorter than:' + minTTL); // 44
  }                                                                                  // 45
});                                                                                  // 46
                                                                                     // 47
var log = {                                                                          // 48
  info: function(message) {                                                          // 49
    if (SyncedCron.options.log)                                                      // 50
      console.log(message);                                                          // 51
  }                                                                                  // 52
}                                                                                    // 53
                                                                                     // 54
// add a scheduled job                                                               // 55
// SyncedCron.add({                                                                  // 56
//   name: String, //*required* unique name of the job                               // 57
//   schedule: function(laterParser) {},//*required* when to run the job             // 58
//   job: function() {}, //*required* the code to run                                // 59
// });                                                                               // 60
SyncedCron.add = function(entry) {                                                   // 61
  check(entry.name, String);                                                         // 62
  check(entry.schedule, Function);                                                   // 63
  check(entry.job, Function);                                                        // 64
                                                                                     // 65
  // check                                                                           // 66
  this._entries[entry.name] = entry;                                                 // 67
}                                                                                    // 68
                                                                                     // 69
// Start processing added jobs                                                       // 70
SyncedCron.start = function() {                                                      // 71
  var self = this;                                                                   // 72
                                                                                     // 73
  Meteor.startup(function() {                                                        // 74
    // Schedule each job with later.js                                               // 75
    _.each(self._entries, function(entry, name) {                                    // 76
      var schedule = entry.schedule(Later.parse);                                    // 77
      entry._timer = self._laterSetInterval(self._entryWrapper(entry), schedule);    // 78
                                                                                     // 79
      log.info('SyncedCron: scheduled "' + entry.name + '" next run @'               // 80
        + Later.schedule(schedule).next(1));                                         // 81
    });                                                                              // 82
  });                                                                                // 83
}                                                                                    // 84
                                                                                     // 85
// Return the next scheduled date of the first matching entry or undefined           // 86
SyncedCron.nextScheduledAtDate = function(jobName) {                                 // 87
  var entry = this._entries[jobName];                                                // 88
                                                                                     // 89
  if (entry)                                                                         // 90
    return Later.schedule(entry.schedule(Later.parse)).next(1);                      // 91
}                                                                                    // 92
                                                                                     // 93
// Remove and stop the entry referenced by jobName                                   // 94
SyncedCron.remove = function(jobName) {                                              // 95
  var entry = this._entries[jobName];                                                // 96
                                                                                     // 97
  if (entry) {                                                                       // 98
    if (entry._timer)                                                                // 99
      entry._timer.clear();                                                          // 100
                                                                                     // 101
    delete this._entries[jobName];                                                   // 102
    log.info('SyncedCron: Removed "' + entry.name);                                  // 103
  }                                                                                  // 104
}                                                                                    // 105
                                                                                     // 106
// Stop processing and remove ALL jobs                                               // 107
SyncedCron.stop = function() {                                                       // 108
  _.each(this._entries, function(entry, name) {                                      // 109
    SyncedCron.remove(name);                                                         // 110
  });                                                                                // 111
}                                                                                    // 112
                                                                                     // 113
// The meat of our logic. Checks if the specified has already run. If not,           // 114
// records that it's running the job, runs it, and records the output                // 115
SyncedCron._entryWrapper = function(entry) {                                         // 116
  var self = this;                                                                   // 117
                                                                                     // 118
  return function(intendedAt) {                                                      // 119
    var jobHistory = {                                                               // 120
      intendedAt: intendedAt,                                                        // 121
      name: entry.name,                                                              // 122
      startedAt: new Date()                                                          // 123
    };                                                                               // 124
                                                                                     // 125
    // If we have a dup key error, another instance has already tried to run         // 126
    // this job.                                                                     // 127
    try {                                                                            // 128
      jobHistory._id = self._collection.insert(jobHistory);                          // 129
    } catch(e) {                                                                     // 130
      // http://www.mongodb.org/about/contributors/error-codes/                      // 131
      // 11000 == duplicate key error                                                // 132
      if (e.name === 'MongoError' && e.code === 11000) {                             // 133
        log.info('SyncedCron: Not running "' + entry.name + '" again.');             // 134
        return;                                                                      // 135
      }                                                                              // 136
                                                                                     // 137
      throw e;                                                                       // 138
    };                                                                               // 139
                                                                                     // 140
    // run and record the job                                                        // 141
    try {                                                                            // 142
      log.info('SyncedCron: Starting "' + entry.name + '".');                        // 143
      var output = entry.job(intendedAt); // <- Run the actual job                   // 144
                                                                                     // 145
      log.info('SyncedCron: Finished "' + entry.name + '".');                        // 146
      self._collection.update({_id: jobHistory._id}, {                               // 147
        $set: {                                                                      // 148
          finishedAt: new Date(),                                                    // 149
          result: output                                                             // 150
        }                                                                            // 151
      });                                                                            // 152
    } catch(e) {                                                                     // 153
      log.info('SyncedCron: Exception "' + entry.name +'" ' + e.stack);              // 154
      self._collection.update({_id: jobHistory._id}, {                               // 155
        $set: {                                                                      // 156
          finishedAt: new Date(),                                                    // 157
          error: e.stack                                                             // 158
        }                                                                            // 159
      });                                                                            // 160
    }                                                                                // 161
  };                                                                                 // 162
}                                                                                    // 163
                                                                                     // 164
// for tests                                                                         // 165
SyncedCron._reset = function() {                                                     // 166
  this._entries = {};                                                                // 167
  this._collection.remove({});                                                       // 168
}                                                                                    // 169
                                                                                     // 170
// ---------------------------------------------------------------------------       // 171
// The following two functions are lifted from the later.js package, however         // 172
// I've made the following changes:                                                  // 173
// - Use Meteor.setTimeout and Meteor.clearTimeout                                   // 174
// - Added an 'intendedAt' parameter to the callback fn that specifies the precise   // 175
//   time the callback function *should* be run (so we can co-ordinate jobs)         // 176
//   between multiple, potentially laggy and unsynced machines                       // 177
                                                                                     // 178
// From: https://github.com/bunkat/later/blob/master/src/core/setinterval.js         // 179
SyncedCron._laterSetInterval = function(fn, sched) {                                 // 180
                                                                                     // 181
  var t = SyncedCron._laterSetTimeout(scheduleTimeout, sched),                       // 182
      done = false;                                                                  // 183
                                                                                     // 184
  /**                                                                                // 185
  * Executes the specified function and then sets the timeout for the next           // 186
  * interval.                                                                        // 187
  */                                                                                 // 188
  function scheduleTimeout(intendedAt) {                                             // 189
    if(!done) {                                                                      // 190
      fn(intendedAt);                                                                // 191
      t = SyncedCron._laterSetTimeout(scheduleTimeout, sched);                       // 192
    }                                                                                // 193
  }                                                                                  // 194
                                                                                     // 195
  return {                                                                           // 196
                                                                                     // 197
    /**                                                                              // 198
    * Clears the timeout.                                                            // 199
    */                                                                               // 200
    clear: function() {                                                              // 201
      done = true;                                                                   // 202
      t.clear();                                                                     // 203
    }                                                                                // 204
                                                                                     // 205
  };                                                                                 // 206
                                                                                     // 207
};                                                                                   // 208
                                                                                     // 209
// From: https://github.com/bunkat/later/blob/master/src/core/settimeout.js          // 210
SyncedCron._laterSetTimeout = function(fn, sched) {                                  // 211
                                                                                     // 212
  var s = Later.schedule(sched), t;                                                  // 213
  scheduleTimeout();                                                                 // 214
                                                                                     // 215
  /**                                                                                // 216
  * Schedules the timeout to occur. If the next occurrence is greater than the       // 217
  * max supported delay (2147483647 ms) than we delay for that amount before         // 218
  * attempting to schedule the timeout again.                                        // 219
  */                                                                                 // 220
  function scheduleTimeout() {                                                       // 221
    var now = Date.now(),                                                            // 222
        next = s.next(2, now),                                                       // 223
        diff = next[0].getTime() - now,                                              // 224
        intendedAt = next[0];                                                        // 225
                                                                                     // 226
    // minimum time to fire is one second, use next occurrence instead               // 227
    if(diff < 1000) {                                                                // 228
      diff = next[1].getTime() - now;                                                // 229
      intendedAt = next[1];                                                          // 230
    }                                                                                // 231
                                                                                     // 232
    if(diff < 2147483647) {                                                          // 233
      t = Meteor.setTimeout(function() { fn(intendedAt); }, diff);                   // 234
    }                                                                                // 235
    else {                                                                           // 236
      t = Meteor.setTimeout(scheduleTimeout, 2147483647);                            // 237
    }                                                                                // 238
  }                                                                                  // 239
                                                                                     // 240
  return {                                                                           // 241
                                                                                     // 242
    /**                                                                              // 243
    * Clears the timeout.                                                            // 244
    */                                                                               // 245
    clear: function() {                                                              // 246
      Meteor.clearTimeout(t);                                                        // 247
    }                                                                                // 248
                                                                                     // 249
  };                                                                                 // 250
                                                                                     // 251
};                                                                                   // 252
// ---------------------------------------------------------------------------       // 253
///////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['percolatestudio:synced-cron'] = {
  SyncedCron: SyncedCron
};

})();

//# sourceMappingURL=percolatestudio_synced-cron.js.map
