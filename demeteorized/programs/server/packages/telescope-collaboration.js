(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var deepExtend = Package['telescope-lib'].deepExtend;
var camelToDash = Package['telescope-lib'].camelToDash;
var dashToCamel = Package['telescope-lib'].dashToCamel;
var camelCaseify = Package['telescope-lib'].camelCaseify;
var getSetting = Package['telescope-lib'].getSetting;
var getThemeSetting = Package['telescope-lib'].getThemeSetting;
var getSiteUrl = Package['telescope-lib'].getSiteUrl;
var trimWords = Package['telescope-lib'].trimWords;
var can = Package['telescope-lib'].can;
var _ = Package['telescope-lib']._;
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
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;

/* Package-scope variables */
var addCollaborator, Collaboration, show, hide, createCollaboration, collaborationSchema, Schemas, getCollaborationUrl, properties;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/telescope-collaboration/lib/collaboration.js                                                           //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
                                                                                                                   // 1
collaborationSchema = new SimpleSchema({                                                                           // 2
   _id: {                                                                                                          // 3
      type: String,                                                                                                // 4
      optional: true                                                                                               // 5
    },                                                                                                             // 6
    slug: {                                                                                                        // 7
      type: String,                                                                                                // 8
    },                                                                                                             // 9
    name: {                                                                                                        // 10
      type: String,                                                                                                // 11
    },                                                                                                             // 12
                                                                                                                   // 13
    description: {                                                                                                 // 14
        type: String,                                                                                              // 15
    },                                                                                                             // 16
    collaborators: {                                                                                               // 17
        type:[String],                                                                                             // 18
        autoform: {                                                                                                // 19
            type: "select2",                                                                                       // 20
            afFieldInput: {                                                                                        // 21
                multiple: true                                                                                     // 22
            }                                                                                                      // 23
        }                                                                                                          // 24
    },                                                                                                             // 25
        /*                                                                                                         // 26
    administrators: {                                                                                              // 27
        type:[String],                                                                                             // 28
        optional: true                                                                                             // 29
    }                                                                                                              // 30
        */                                                                                                         // 31
                                                                                                                   // 32
});                                                                                                                // 33
                                                                                                                   // 34
Collaboration = new Meteor.Collection("collaboration", {                                                           // 35
 // schema: collaborationSchema                                                                                    // 36
});                                                                                                                // 37
                                                                                                                   // 38
Collaboration.attachSchema(collaborationSchema);                                                                   // 39
                                                                                                                   // 40
Schemas = { collaboration: collaborationSchema };                                                                  // 41
                                                                                                                   // 42
                                                                                                                   // 43
// collaboration post list parameters                                                                              // 44
viewParameters.collaboration = function (terms) {                                                                  // 45
  return {                                                                                                         // 46
    find: {'collaboration': terms.collaboration},                                                                  // 47
    options: {sort: {sticky: -1, score: -1}}                                                                       // 48
  };                                                                                                               // 49
}                                                                                                                  // 50
                                                                                                                   // 51
// push "collaboration" modules to postHeading                                                                     // 52
postHeading.push({                                                                                                 // 53
  template: 'collaborationTagList',                                                                                // 54
  order: 3                                                                                                         // 55
});                                                                                                                // 56
                                                                                                                   // 57
// push "collaborationMenu" template to primaryNav                                                                 // 58
primaryNav.push('collaborationMenu');                                                                              // 59
                                                                                                                   // 60
// push "collaboration" property to addToPostSchema, so that it's later added to postSchema                        // 61
addToPostSchema.push(                                                                                              // 62
  {                                                                                                                // 63
    propertyName: 'collaboration',                                                                                 // 64
    propertySchema: {                                                                                              // 65
      optional: true,                                                                                              // 66
      type: [String]                                                                                               // 67
    }                                                                                                              // 68
  }                                                                                                                // 69
);                                                                                                                 // 70
                                                                                                                   // 71
var getCheckedCollaboration = function (properties) {                                                              // 72
  properties.collaboration = [];                                                                                   // 73
  $('input[name=collaboration]:checked').each(function() {                                                         // 74
    var collaborationId = $(this).val();                                                                           // 75
    properties.collaboration.push(Collaboration.findOne(collaborationId));                                         // 76
  });                                                                                                              // 77
  return properties;                                                                                               // 78
}                                                                                                                  // 79
                                                                                                                   // 80
postSubmitClientCallbacks.push(getCheckedCollaboration);                                                           // 81
postEditClientCallbacks.push(getCheckedCollaboration);                                                             // 82
                                                                                                                   // 83
Meteor.startup(function () {                                                                                       // 84
  Collaboration.allow({                                                                                            // 85
    insert: isAdminById                                                                                            // 86
  , update: isAdminById                                                                                            // 87
  , remove: isAdminById                                                                                            // 88
  });                                                                                                              // 89
                                                                                                                   // 90
});                                                                                                                // 91
                                                                                                                   // 92
getCollaborationUrl = function(slug){                                                                              // 93
  return getSiteUrl()+'collaboration/'+slug;                                                                       // 94
};                                                                                                                 // 95
                                                                                                                   // 96
                                                                                                                   // 97
                                                                                                                   // 98
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/telescope-collaboration/lib/server/publications.js                                                     //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
Meteor.publish('collaboration', function() {                                                                       // 1
  if(canViewById(this.userId)){                                                                                    // 2
      var f = Collaboration.find();                                                                                // 3
      console.log("collaboration found ", f.count())                                                               // 4
      return f;                                                                                                    // 5
  }                                                                                                                // 6
  return [];                                                                                                       // 7
});                                                                                                                // 8
                                                                                                                   // 9
                                                                                                                   // 10
                                                                                                                   // 11
addToPostSchema.push(                                                                                              // 12
    {                                                                                                              // 13
        propertyName: 'collaboration',                                                                             // 14
        propertySchema: {                                                                                          // 15
            type: [String],                                                                                        // 16
            optional: true                                                                                         // 17
        }                                                                                                          // 18
    }                                                                                                              // 19
);                                                                                                                 // 20
                                                                                                                   // 21
                                                                                                                   // 22
Meteor.methods({                                                                                                   // 23
  addCollaboratorToCollaboration : function(params) {                                                              // 24
      console.log("addCollaboratorToCollaboration method")                                                         // 25
    var ret = Posts.update({_id: params.post_id}, {$addToSet: {collaboration: params.collaboration_name} }, function foo(err) {
          console.log("addCollaboratorToCollaboration Posts update params,err=", params, err);                     // 27
        }                                                                                                          // 28
    );                                                                                                             // 29
  },                                                                                                               // 30
  createCollaboration : function(bundle) { }                                                                       // 31
  }                                                                                                                // 32
);                                                                                                                 // 33
                                                                                                                   // 34
                                                                                                                   // 35
                                                                                                                   // 36
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/telescope-collaboration/lib/server/methods.js                                                          //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
                                                                                                                   // 1
function TelescopePost(post, userId, isSimulation){                                                                // 2
    var title = cleanUp(post.title),                                                                               // 3
        body = post.body,                                                                                          // 4
        userId = userId,                                                                                           // 5
        user = Meteor.users.findOne(userId),                                                                       // 6
        timeSinceLastPost=timeSinceLast(user, Posts),                                                              // 7
        numberOfPostsInPast24Hours=numberOfItemsInPast24Hours(user, Posts),                                        // 8
        postInterval = Math.abs(parseInt(getSetting('postInterval', 30))),                                         // 9
        maxPostsPer24Hours = Math.abs(parseInt(getSetting('maxPostsPerDay', 30))),                                 // 10
        postId = '';                                                                                               // 11
                                                                                                                   // 12
    console.log("TelescopePost 13");                                                                               // 13
                                                                                                                   // 14
    // ------------------------------ Checks ------------------------------ //                                     // 15
                                                                                                                   // 16
    // check that user can post                                                                                    // 17
    if (!user || !canPost(user))                                                                                   // 18
      throw new Meteor.Error(601, i18n.t('You need to login or be invited to post new stories.'));                 // 19
                                                                                                                   // 20
    // check that user provided a title                                                                            // 21
    if(!post.title)                                                                                                // 22
      throw new Meteor.Error(602, i18n.t('Please fill in a title'));                                               // 23
                                                                                                                   // 24
                                                                                                                   // 25
    if(!!post.url){                                                                                                // 26
      // check that there are no previous posts with the same link in the past 6 months                            // 27
      var sixMonthsAgo = moment().subtract(6, 'months').toDate();                                                  // 28
      var postWithSameLink = Posts.findOne({url: post.url, postedAt: {$gte: sixMonthsAgo}});                       // 29
                                                                                                                   // 30
      if(typeof postWithSameLink !== 'undefined'){                                                                 // 31
        Meteor.call('upvotePost', postWithSameLink);                                                               // 32
        throw new Meteor.Error(603, i18n.t('This link has already been posted'), postWithSameLink._id);            // 33
      }                                                                                                            // 34
    }                                                                                                              // 35
                                                                                                                   // 36
    console.log("TelescopePost 37");                                                                               // 37
    /*                                                                                                             // 38
    if(!isAdmin(Meteor.user())){                                                                                   // 39
      // check that user waits more than X seconds between posts                                                   // 40
      if(!isSimulation && timeSinceLastPost < postInterval)                                                        // 41
        throw new Meteor.Error(604, i18n.t('Please wait ')+(postInterval-timeSinceLastPost)+i18n.t(' seconds before posting again'));
                                                                                                                   // 43
      // check that the user doesn't post more than Y posts per day                                                // 44
      if(!isSimulation && numberOfPostsInPast24Hours > maxPostsPer24Hours)                                         // 45
        throw new Meteor.Error(605, i18n.t('Sorry, you cannot submit more than ')+maxPostsPer24Hours+i18n.t(' posts per day'));
    }                                                                                                              // 47
    */                                                                                                             // 48
                                                                                                                   // 49
    // ------------------------------ Properties ------------------------------ //                                 // 50
                                                                                                                   // 51
    console.log("TelescopePost 52");                                                                               // 52
    // Basic Properties                                                                                            // 53
    properties = {                                                                                                 // 54
      title: title,                                                                                                // 55
      body: body,                                                                                                  // 56
      userId: userId,                                                                                              // 57
      author: getDisplayNameById(userId),                                                                          // 58
      upvotes: 0,                                                                                                  // 59
      downvotes: 0,                                                                                                // 60
      commentsCount: 0,                                                                                            // 61
      baseScore: 0,                                                                                                // 62
      score: 0,                                                                                                    // 63
      inactive: false                                                                                              // 64
    };                                                                                                             // 65
                                                                                                                   // 66
    console.log("TelescopePost 67");                                                                               // 67
    properties.userId = post.userId;                                                                               // 68
    console.log("TelescopePost 69");                                                                               // 69
                                                                                                                   // 70
    properties.status = 2;                                                                                         // 71
                                                                                                                   // 72
    // CreatedAt                                                                                                   // 73
    properties.createdAt = new Date();                                                                             // 74
    console.log("TelescopePost 73");                                                                               // 75
                                                                                                                   // 76
    // PostedAt                                                                                                    // 77
    properties.postedAt = new Date();                                                                              // 78
                                                                                                                   // 79
    post = _.extend(post, properties);                                                                             // 80
                                                                                                                   // 81
    // ------------------------------ Callbacks ------------------------------ //                                  // 82
                                                                                                                   // 83
    console.log("TelescopePost 82");                                                                               // 84
    // run all post submit server callbacks on post object successively                                            // 85
    post = postSubmitMethodCallbacks.reduce(function(result, currentFunction) {                                    // 86
        return currentFunction(result);                                                                            // 87
    }, post);                                                                                                      // 88
    console.log("TelescopePost 87");                                                                               // 89
                                                                                                                   // 90
    // ------------------------------ Insert ------------------------------ //                                     // 91
                                                                                                                   // 92
    // console.log(post)                                                                                           // 93
    console.log("TelescopePost 94");                                                                               // 94
    post._id = Posts.insert(post);                                                                                 // 95
    console.log("TelescopePost 96");                                                                               // 96
                                                                                                                   // 97
    // ------------------------------ MedBook Post Files ----------------------- //                                // 98
    if (post.blobs && post.blobs.length >0)                                                                        // 99
       for (var i = 0; i < post.blobs.length; i++)  {                                                              // 100
          var fid = post.blobs[i];                                                                                 // 101
          FileUploadCollection.update({"_id": new Meteor.Collection.ObjectID(fid)}, { "$set" : { "postId" : post._id } })
       }                                                                                                           // 103
                                                                                                                   // 104
                                                                                                                   // 105
    // ------------------------------ Callbacks ------------------------------ //                                  // 106
                                                                                                                   // 107
    // run all post submit server callbacks on post object successively                                            // 108
    post = postAfterSubmitMethodCallbacks.reduce(function(result, currentFunction) {                               // 109
        return currentFunction(result);                                                                            // 110
    }, post);                                                                                                      // 111
                                                                                                                   // 112
    // ------------------------------ Post-Insert ------------------------------ //                                // 113
                                                                                                                   // 114
    // increment posts count                                                                                       // 115
    Meteor.users.update({_id: userId}, {$inc: {postCount: 1}});                                                    // 116
                                                                                                                   // 117
    var postAuthor =  Meteor.users.findOne(post.userId);                                                           // 118
                                                                                                                   // 119
    Meteor.call('upvotePost', post, postAuthor);                                                                   // 120
                                                                                                                   // 121
    return post;                                                                                                   // 122
  }                                                                                                                // 123
function MedBookPost(post,userId) {                                                                                // 124
    // ------------------------------ Properties ------------------------------ //                                 // 125
                                                                                                                   // 126
    // Basic Properties                                                                                            // 127
                                                                                                                   // 128
    console.log("MedBookPost");                                                                                    // 129
                                                                                                                   // 130
    // ------------------------------ Insert Post ----------------------- //                                       // 131
    post._id = Posts.insert(post);                                                                                 // 132
                                                                                                                   // 133
    // ------------------------------ MedBook Post Files ----------------------- //                                // 134
    if (post.blobs && post.blobs.length >0)                                                                        // 135
        for (var i = 0; i < post.blobs.length; i++)  {                                                             // 136
            var fid = post.blobs[i];                                                                               // 137
            FileUploadCollection.update({"_id": new Meteor.Collection.ObjectID(fid)}, { "$set" : { "postId" : post._id } })
        }                                                                                                          // 139
                                                                                                                   // 140
                                                                                                                   // 141
    // ------------------------------ Callbacks ------------------------------ //                                  // 142
                                                                                                                   // 143
    // run all post submit server callbacks on post object successively                                            // 144
    post = postAfterSubmitMethodCallbacks.reduce(function(result, currentFunction) {                               // 145
        return currentFunction(result);                                                                            // 146
    }, post);                                                                                                      // 147
                                                                                                                   // 148
    // ------------------------------ Post-Insert ------------------------------ //                                // 149
                                                                                                                   // 150
    // increment posts count                                                                                       // 151
    Meteor.users.update({_id: userId}, {$inc: {postCount: 1}});                                                    // 152
    var postAuthor =  Meteor.users.findOne(post.userId);                                                           // 153
    Meteor.call('upvotePost', post, postAuthor);                                                                   // 154
    return post._id;                                                                                               // 155
}                                                                                                                  // 156
                                                                                                                   // 157
                                                                                                                   // 158
Meteor.startup(function () {                                                                                       // 159
                                                                                                                   // 160
  Meteor.methods({                                                                                                 // 161
    createCollaborationMethod: function(collaboration){                                                            // 162
              console.log(collaboration)                                                                           // 163
              if (!Meteor.user() || !isAdmin(Meteor.user()))                                                       // 164
                  throw new Meteor.Error(i18n.t('You need to login and be an admin to add a new collaboration.')); // 165
                                                                                                                   // 166
              Collaboration.insert(collaboration);                                                                 // 167
              return collaboration.name;                                                                           // 168
          },                                                                                                       // 169
    joinCollaborationMethod: function(collaboration_id) {                                                          // 170
          console.log("joinCollaborationMethod")                                                                   // 171
          var ad = Meteor.user().emails[0].address;                                                                // 172
          Collaboration.update({_id: collaboration_id}, { $addToSet: { collaborators: ad, administrators:ad }}, function (err, err2){
                  console.log("joinCollaborationMethod Collaboration.update", collaboration_id, ad, err, err2)     // 174
              }                                                                                                    // 175
          );                                                                                                       // 176
                                                                                                                   // 177
      },                                                                                                           // 178
    leaveCollaborationMethod: function(collaboration_id) {                                                         // 179
        console.log("joinCollaborationMethod")                                                                     // 180
        var ad = Meteor.user().emails[0].address;                                                                  // 181
        Collaboration.update({_id: collaboration_id}, { $pull: { collaborators: ad, administrators:ad  }}, function (err, err2){
              console.log("joinCollaborationMethod Collaboration.update", collaboration_id, ad, err, err2)         // 183
          }                                                                                                        // 184
    );                                                                                                             // 185
                                                                                                                   // 186
          },                                                                                                       // 187
                                                                                                                   // 188
  });                                                                                                              // 189
                                                                                                                   // 190
var querystring =  Npm.require("querystring")                                                                      // 191
  HTTP.methods({                                                                                                   // 192
    medbookPost: function(data){                                                                                   // 193
        var qs = querystring.parse(String(data));                                                                  // 194
                                                                                                                   // 195
        var user = Meteor.users.findOne({                                                                          // 196
            $or: [                                                                                                 // 197
                {'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(qs.token)},                   // 198
                {'services.resume.loginTokens.token': qs.token}                                                    // 199
            ]                                                                                                      // 200
        });                                                                                                        // 201
                                                                                                                   // 202
        if (user == null) {                                                                                        // 203
            this.setStatusCode(401); // Unauthorized                                                               // 204
            return { state: "failed", reason: "token not found" }                                                  // 205
        }                                                                                                          // 206
        this.setUserId(user._id)                                                                                   // 207
                                                                                                                   // 208
        var post = JSON.parse(qs.json);                                                                            // 209
        post.userId   = user._id;                                                                                  // 210
        post.sticky   = false;                                                                                     // 211
        post.status   = STATUS_APPROVED;                                                                           // 212
        post.postedAt = new Date();                                                                                // 213
        post.createdAt = post.postedAt;                                                                            // 214
        post.commentsCount = 0;                                                                                    // 215
        post.downvotes = 0;                                                                                        // 216
        post.inactive = false;                                                                                     // 217
        post.score = 0;                                                                                            // 218
        post.upvotes = 0;                                                                                          // 219
        console.log("post", post)                                                                                  // 220
                                                                                                                   // 221
        // TelescopePost(post, post.userId, false);                                                                // 222
        var _id = MedBookPost(post, post.userId);                                                                  // 223
        return { state: "success", _id: _id}                                                                       // 224
     }                                                                                                             // 225
  });                                                                                                              // 226
});                                                                                                                // 227
                                                                                                                   // 228
                                                                                                                   // 229
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-collaboration'] = {
  addCollaborator: addCollaborator,
  Collaboration: Collaboration,
  show: show,
  hide: hide,
  createCollaboration: createCollaboration,
  collaborationSchema: collaborationSchema,
  Schemas: Schemas
};

})();

//# sourceMappingURL=telescope-collaboration.js.map
