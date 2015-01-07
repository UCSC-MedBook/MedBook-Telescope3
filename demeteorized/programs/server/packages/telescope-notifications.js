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
var buildEmailTemplate = Package['telescope-email'].buildEmailTemplate;
var sendEmail = Package['telescope-email'].sendEmail;
var buildAndSendEmail = Package['telescope-email'].buildAndSendEmail;
var getEmailTemplate = Package['telescope-email'].getEmailTemplate;
var Router = Package['iron:router'].Router;
var RouteController = Package['iron:router'].RouteController;
var Herald = Package['kestanous:herald'].Herald;
var TAPi18next = Package['tap:i18n'].TAPi18next;
var TAPi18n = Package['tap:i18n'].TAPi18n;
var Handlebars = Package['cmather:handlebars-server'].Handlebars;
var OriginalHandlebars = Package['cmather:handlebars-server'].OriginalHandlebars;
var Iron = Package['iron:core'].Iron;

/* Package-scope variables */
var Herald, buildEmailNotification, getUnsubscribeLink, notificationEmail, __;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/telescope-notifications/lib/notifications.js                                                    //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
// add new post notification callback on post submit                                                        // 1
postAfterSubmitMethodCallbacks.push(function (post) {                                                       // 2
  if(Meteor.isServer){                                                                                      // 3
    var userIds = Meteor.users.find({'profile.notifications.posts': 1}, {fields: {}}).map(function (user) { // 4
      return user._id                                                                                       // 5
    });                                                                                                     // 6
    Herald.createNotification(userIds, {courier: 'newPost', data: post})                                    // 7
  }                                                                                                         // 8
  return post;                                                                                              // 9
});                                                                                                         // 10
                                                                                                            // 11
// add new comment notification callback on comment submit                                                  // 12
commentAfterSubmitMethodCallbacks.push(function (comment) {                                                 // 13
  if(Meteor.isServer){                                                                                      // 14
                                                                                                            // 15
    var parentCommentId = comment.parentCommentId;                                                          // 16
    var user = Meteor.user();                                                                               // 17
    var post = Posts.findOne(comment.postId);                                                               // 18
    var postUser = Meteor.users.findOne(post.userId);                                                       // 19
                                                                                                            // 20
    var notificationData = {                                                                                // 21
      comment: _.pick(comment, '_id', 'userId', 'author', 'body'),                                          // 22
      post: _.pick(post, '_id', 'title', 'url')                                                             // 23
    };                                                                                                      // 24
                                                                                                            // 25
    if(parentCommentId){                                                                                    // 26
      // child comment                                                                                      // 27
      var parentComment = Comments.findOne(parentCommentId);                                                // 28
      var parentUser = Meteor.users.findOne(parentComment.userId);                                          // 29
                                                                                                            // 30
      notificationData.parentComment = _.pick(parentComment, '_id', 'userId', 'author');                    // 31
                                                                                                            // 32
      // reply notification                                                                                 // 33
      // do not notify users of their own actions (i.e. they're replying to themselves)                     // 34
      if(parentUser._id != user._id)                                                                        // 35
        Herald.createNotification(parentUser._id, {courier: 'newReply', data: notificationData})            // 36
                                                                                                            // 37
      // comment notification                                                                               // 38
      // if the original poster is different from the author of the parent comment, notify them too         // 39
      if(postUser._id != user._id && parentComment.userId != post.userId)                                   // 40
        Herald.createNotification(postUser._id, {courier: 'newComment', data: notificationData})            // 41
                                                                                                            // 42
    }else{                                                                                                  // 43
      // root comment                                                                                       // 44
      // don't notify users of their own comments                                                           // 45
      if(postUser._id != user._id)                                                                          // 46
        Herald.createNotification(postUser._id, {courier: 'newComment', data: notificationData})            // 47
    }                                                                                                       // 48
  }                                                                                                         // 49
                                                                                                            // 50
  return comment;                                                                                           // 51
});                                                                                                         // 52
                                                                                                            // 53
var emailNotifications = {                                                                                  // 54
  propertyName: 'emailNotifications',                                                                       // 55
  propertySchema: {                                                                                         // 56
    type: Boolean,                                                                                          // 57
    optional: true,                                                                                         // 58
    defaultValue: true,                                                                                     // 59
    autoform: {                                                                                             // 60
      group: 'notifications',                                                                               // 61
      instructions: 'Enable email notifications for new posts and new comments (requires restart).'         // 62
    }                                                                                                       // 63
  }                                                                                                         // 64
}                                                                                                           // 65
addToSettingsSchema.push(emailNotifications);                                                               // 66
                                                                                                            // 67
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/telescope-notifications/lib/herald.js                                                           //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
Meteor.startup(function () {                                                                                // 1
                                                                                                            // 2
  Herald.collection.deny({                                                                                  // 3
    update: ! can.editById,                                                                                 // 4
    remove: ! can.editById                                                                                  // 5
  });                                                                                                       // 6
                                                                                                            // 7
  // disable all email notifications when "emailNotifications" is set to false                              // 8
  if (getSetting('emailNotifications', true)) {                                                             // 9
    Herald.settings.overrides.email = false;                                                                // 10
  } else {                                                                                                  // 11
    Herald.settings.overrides.email = true;                                                                 // 12
  };                                                                                                        // 13
});                                                                                                         // 14
                                                                                                            // 15
var commentEmail = function (userToNotify) {                                                                // 16
  var notification = this;                                                                                  // 17
  // put in setTimeout so it doesn't hold up the rest of the method                                         // 18
  Meteor.setTimeout(function () {                                                                           // 19
    notificationEmail = buildEmailNotification(notification);                                               // 20
    sendEmail(getEmail(userToNotify), notificationEmail.subject, notificationEmail.html);                   // 21
  }, 1);                                                                                                    // 22
}                                                                                                           // 23
                                                                                                            // 24
var getCommenterProfileUrl = function (comment) {                                                           // 25
  var user = Meteor.users.findOne(comment.userId);                                                          // 26
  if(user) {                                                                                                // 27
    return getProfileUrl(user);                                                                             // 28
  } else {                                                                                                  // 29
    return getProfileUrlById(comment.userId)                                                                // 30
  }                                                                                                         // 31
}                                                                                                           // 32
                                                                                                            // 33
var getAuthor = function (comment) {                                                                        // 34
  var user = Meteor.users.findOne(comment.userId);                                                          // 35
  if(user) {                                                                                                // 36
    return getUserName(user);                                                                               // 37
  } else {                                                                                                  // 38
    return comment.author;                                                                                  // 39
  }                                                                                                         // 40
}                                                                                                           // 41
                                                                                                            // 42
Herald.addCourier('newPost', {                                                                              // 43
  media: {                                                                                                  // 44
    email: {                                                                                                // 45
      emailRunner: function (user) {                                                                        // 46
        var p = getPostProperties(this.data);                                                               // 47
        var subject = p.postAuthorName+' has created a new post: '+p.postTitle;                             // 48
        var html = buildEmailTemplate(getEmailTemplate('emailNewPost')(p));                                 // 49
        sendEmail(getEmail(user), subject, html);                                                           // 50
      }                                                                                                     // 51
    }                                                                                                       // 52
  }                                                                                                         // 53
  // message: function (user) { return 'email template?' }                                                  // 54
});                                                                                                         // 55
                                                                                                            // 56
Herald.addCourier('newComment', {                                                                           // 57
  media: {                                                                                                  // 58
    onsite: {},                                                                                             // 59
    email: {                                                                                                // 60
      emailRunner: commentEmail                                                                             // 61
    }                                                                                                       // 62
  },                                                                                                        // 63
  message: {                                                                                                // 64
    default: function (user) {                                                                              // 65
       return Blaze.toHTML(Blaze.With(this, function(){                                                     // 66
        return Template[getTemplate('notificationNewComment')]                                              // 67
      }));                                                                                                  // 68
    }                                                                                                       // 69
  },                                                                                                        // 70
  transform: {                                                                                              // 71
    profileUrl: function () {                                                                               // 72
      return getCommenterProfileUrl(this.data.comment);                                                     // 73
    },                                                                                                      // 74
    postCommentUrl: function () {                                                                           // 75
      return '/posts/'+ this.data.post._id;                                                                 // 76
    },                                                                                                      // 77
    author: function () {                                                                                   // 78
      return getAuthor(this.data.comment);                                                                  // 79
    },                                                                                                      // 80
    postTitle: function () {                                                                                // 81
      return this.data.post.title;                                                                          // 82
    },                                                                                                      // 83
    url: function () {                                                                                      // 84
      return /comments/ + this.comment._id;                                                                 // 85
    }                                                                                                       // 86
  }                                                                                                         // 87
});                                                                                                         // 88
                                                                                                            // 89
Herald.addCourier('newReply', {                                                                             // 90
  media: {                                                                                                  // 91
    onsite: {},                                                                                             // 92
    email: {                                                                                                // 93
      emailRunner: commentEmail                                                                             // 94
    }                                                                                                       // 95
  },                                                                                                        // 96
  message: {                                                                                                // 97
    default: function (user) {                                                                              // 98
      return Blaze.toHTML(Blaze.With(this, function(){                                                      // 99
        return Template[getTemplate('notificationNewReply')]                                                // 100
      }));                                                                                                  // 101
    }                                                                                                       // 102
  },                                                                                                        // 103
  transform: {                                                                                              // 104
    profileUrl: function () {                                                                               // 105
      return getCommenterProfileUrl(this.data.comment);                                                     // 106
    },                                                                                                      // 107
    postCommentUrl: function () {                                                                           // 108
      return '/posts/'+ this.data.post._id;                                                                 // 109
    },                                                                                                      // 110
    author: function () {                                                                                   // 111
      return getAuthor(this.data.comment);                                                                  // 112
    },                                                                                                      // 113
    postTitle: function () {                                                                                // 114
      return this.data.post.title;                                                                          // 115
    },                                                                                                      // 116
    url: function () {                                                                                      // 117
      return /comments/ + this.parentComment._id;                                                           // 118
    }                                                                                                       // 119
  }                                                                                                         // 120
});                                                                                                         // 121
                                                                                                            // 122
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/telescope-notifications/package-i18n.js                                                         //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
TAPi18n.packages["telescope-notifications"] = {"translation_function_name":"__","helper_name":"_","namespace":"telescope-notifications"};
                                                                                                            // 2
// define package's translation function (proxy to the i18next)                                             // 3
__ = TAPi18n._getPackageI18nextProxy("telescope-notifications");                                            // 4
                                                                                                            // 5
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/telescope-notifications/lib/server/notifications-server.js                                      //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
getUnsubscribeLink = function(user){                                                                        // 1
  return Meteor.absoluteUrl()+'unsubscribe/'+user.email_hash;                                               // 2
};                                                                                                          // 3
                                                                                                            // 4
// given a notification, return the correct subject and html to send an email                               // 5
buildEmailNotification = function (notification) {                                                          // 6
                                                                                                            // 7
  var subject, template;                                                                                    // 8
  var post = notification.data.post;                                                                        // 9
  var comment = notification.data.comment;                                                                  // 10
                                                                                                            // 11
  switch(notification.courier){                                                                             // 12
    case 'newReply':                                                                                        // 13
      subject = 'Someone replied to your comment on "'+post.title+'"';                                      // 14
      template = 'emailNewReply';                                                                           // 15
      break;                                                                                                // 16
                                                                                                            // 17
    case 'newComment':                                                                                      // 18
      subject = 'A new comment on your post "'+post.title+'"';                                              // 19
      template = 'emailNewComment';                                                                         // 20
      break;                                                                                                // 21
                                                                                                            // 22
    default:                                                                                                // 23
      break;                                                                                                // 24
  }                                                                                                         // 25
                                                                                                            // 26
  var emailProperties = _.extend(notification.data, {                                                       // 27
    body: marked(comment.body),                                                                             // 28
    profileUrl: getProfileUrlById(comment.userId),                                                          // 29
    postCommentUrl: getPostCommentUrl(post._id, comment._id),                                               // 30
    postLink: getPostLink(post)                                                                             // 31
  });                                                                                                       // 32
                                                                                                            // 33
  // console.log(emailProperties)                                                                           // 34
                                                                                                            // 35
  var notificationHtml = getEmailTemplate(template)(emailProperties);                                       // 36
  var html = buildEmailTemplate(notificationHtml);                                                          // 37
                                                                                                            // 38
  return {                                                                                                  // 39
    subject: subject,                                                                                       // 40
    html: html                                                                                              // 41
  }                                                                                                         // 42
};                                                                                                          // 43
                                                                                                            // 44
Meteor.methods({                                                                                            // 45
  unsubscribeUser : function(hash){                                                                         // 46
    // TO-DO: currently, if you have somebody's email you can unsubscribe them                              // 47
    // A user-specific salt should be added to the hashing method to prevent this                           // 48
    var user = Meteor.users.findOne({email_hash: hash});                                                    // 49
    if(user){                                                                                               // 50
      var update = Meteor.users.update(user._id, {                                                          // 51
        $set: {                                                                                             // 52
          'profile.notifications.users' : 0,                                                                // 53
          'profile.notifications.posts' : 0,                                                                // 54
          'profile.notifications.comments' : 0,                                                             // 55
          'profile.notifications.replies' : 0                                                               // 56
        }                                                                                                   // 57
      });                                                                                                   // 58
      return true;                                                                                          // 59
    }                                                                                                       // 60
    return false;                                                                                           // 61
  }                                                                                                         // 62
});                                                                                                         // 63
                                                                                                            // 64
                                                                                                            // 65
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/telescope-notifications/lib/server/routes.js                                                    //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
Meteor.startup(function () {                                                                                // 1
                                                                                                            // 2
  // Notification email                                                                                     // 3
                                                                                                            // 4
  Router.route('/email/notification/:id?', {                                                                // 5
    name: 'notification',                                                                                   // 6
    where: 'server',                                                                                        // 7
    action: function() {                                                                                    // 8
      var notification = Notifications.findOne(this.params.id);                                             // 9
      var notificationContents = buildEmailNotification(notification);                                      // 10
      this.response.write(notificationContents.html);                                                       // 11
      this.response.end();                                                                                  // 12
    }                                                                                                       // 13
  });                                                                                                       // 14
                                                                                                            // 15
});                                                                                                         // 16
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/telescope-notifications/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-notifications/i //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
var _ = Package.underscore._,                                                                               // 1
    package_name = "telescope-notifications",                                                               // 2
    namespace = "telescope-notifications";                                                                  // 3
                                                                                                            // 4
if (package_name != "project") {                                                                            // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                   // 6
}                                                                                                           // 7
if(_.isUndefined(TAPi18n.translations["de"])) {                                                             // 8
  TAPi18n.translations["de"] = {};                                                                          // 9
}                                                                                                           // 10
                                                                                                            // 11
if(_.isUndefined(TAPi18n.translations["de"][namespace])) {                                                  // 12
  TAPi18n.translations["de"][namespace] = {};                                                               // 13
}                                                                                                           // 14
                                                                                                            // 15
_.extend(TAPi18n.translations["de"][namespace], {"left_a_new_comment_on":"left a new comment on","has_replied_to_your_comment_on":"has replied to your comment on","mark_as_read":"Mark as read","no_notifications":"No notifications","you_have_been_unsubscribed_from_all_notifications":"You have been unsubscribed from all notifications.","user_not_found":"User not found","1_notification":"1 notification","notifications":"notifications"});
                                                                                                            // 17
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/telescope-notifications/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-notifications/i //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
var _ = Package.underscore._,                                                                               // 1
    package_name = "telescope-notifications",                                                               // 2
    namespace = "telescope-notifications";                                                                  // 3
                                                                                                            // 4
if (package_name != "project") {                                                                            // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                   // 6
}                                                                                                           // 7
// integrate the fallback language translations                                                             // 8
TAPi18n.addResourceBundle("en", namespace, {"left_a_new_comment_on":"left a new comment on","has_replied_to_your_comment_on":"has replied to your comment on","mark_as_read":"Mark as read","no_notifications":"No notifications","you_have_been_unsubscribed_from_all_notifications":"You have been unsubscribed from all notifications.","user_not_found":"User not found","1_notification":"1 notification","notifications":"notifications"});
                                                                                                            // 10
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/telescope-notifications/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-notifications/i //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
var _ = Package.underscore._,                                                                               // 1
    package_name = "telescope-notifications",                                                               // 2
    namespace = "telescope-notifications";                                                                  // 3
                                                                                                            // 4
if (package_name != "project") {                                                                            // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                   // 6
}                                                                                                           // 7
if(_.isUndefined(TAPi18n.translations["es"])) {                                                             // 8
  TAPi18n.translations["es"] = {};                                                                          // 9
}                                                                                                           // 10
                                                                                                            // 11
if(_.isUndefined(TAPi18n.translations["es"][namespace])) {                                                  // 12
  TAPi18n.translations["es"][namespace] = {};                                                               // 13
}                                                                                                           // 14
                                                                                                            // 15
_.extend(TAPi18n.translations["es"][namespace], {"left_a_new_comment_on":"left a new comment on","has_replied_to_your_comment_on":"has replied to your comment on","mark_as_read":"Mark as read","no_notifications":"No notifications","you_have_been_unsubscribed_from_all_notifications":"You have been unsubscribed from all notifications.","user_not_found":"User not found","1_notification":"1 notification","notifications":"notifications"});
                                                                                                            // 17
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/telescope-notifications/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-notifications/i //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
var _ = Package.underscore._,                                                                               // 1
    package_name = "telescope-notifications",                                                               // 2
    namespace = "telescope-notifications";                                                                  // 3
                                                                                                            // 4
if (package_name != "project") {                                                                            // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                   // 6
}                                                                                                           // 7
if(_.isUndefined(TAPi18n.translations["fr"])) {                                                             // 8
  TAPi18n.translations["fr"] = {};                                                                          // 9
}                                                                                                           // 10
                                                                                                            // 11
if(_.isUndefined(TAPi18n.translations["fr"][namespace])) {                                                  // 12
  TAPi18n.translations["fr"][namespace] = {};                                                               // 13
}                                                                                                           // 14
                                                                                                            // 15
_.extend(TAPi18n.translations["fr"][namespace], {"left_a_new_comment_on":"a laissé un nouveau commentaire sur","has_replied_to_your_comment_on":"a répondu à","mark_as_read":"Marquer comme lu","no_notifications":"Aucune notification","you_have_been_unsubscribed_from_all_notifications":"Vous avez été désabonné de toutes les notifications.","user_not_found":"Utilisateur non trouvé","1_notification":"1 notification","notifications":"notifications"});
                                                                                                            // 17
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/telescope-notifications/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-notifications/i //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
var _ = Package.underscore._,                                                                               // 1
    package_name = "telescope-notifications",                                                               // 2
    namespace = "telescope-notifications";                                                                  // 3
                                                                                                            // 4
if (package_name != "project") {                                                                            // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                   // 6
}                                                                                                           // 7
if(_.isUndefined(TAPi18n.translations["it"])) {                                                             // 8
  TAPi18n.translations["it"] = {};                                                                          // 9
}                                                                                                           // 10
                                                                                                            // 11
if(_.isUndefined(TAPi18n.translations["it"][namespace])) {                                                  // 12
  TAPi18n.translations["it"][namespace] = {};                                                               // 13
}                                                                                                           // 14
                                                                                                            // 15
_.extend(TAPi18n.translations["it"][namespace], {"left_a_new_comment_on":"left a new comment on","has_replied_to_your_comment_on":"has replied to your comment on","mark_as_read":"Mark as read","no_notifications":"No notifications","you_have_been_unsubscribed_from_all_notifications":"You have been unsubscribed from all notifications.","user_not_found":"User not found","1_notification":"1 notification","notifications":"notifications"});
                                                                                                            // 17
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/telescope-notifications/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-notifications/i //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
var _ = Package.underscore._,                                                                               // 1
    package_name = "telescope-notifications",                                                               // 2
    namespace = "telescope-notifications";                                                                  // 3
                                                                                                            // 4
if (package_name != "project") {                                                                            // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                   // 6
}                                                                                                           // 7
if(_.isUndefined(TAPi18n.translations["zh-CN"])) {                                                          // 8
  TAPi18n.translations["zh-CN"] = {};                                                                       // 9
}                                                                                                           // 10
                                                                                                            // 11
if(_.isUndefined(TAPi18n.translations["zh-CN"][namespace])) {                                               // 12
  TAPi18n.translations["zh-CN"][namespace] = {};                                                            // 13
}                                                                                                           // 14
                                                                                                            // 15
_.extend(TAPi18n.translations["zh-CN"][namespace], {"left_a_new_comment_on":"left a new comment on","has_replied_to_your_comment_on":"has replied to your comment on","mark_as_read":"Mark as read","no_notifications":"No notifications","you_have_been_unsubscribed_from_all_notifications":"You have been unsubscribed from all notifications.","user_not_found":"User not found","1_notification":"1 notification","notifications":"notifications"});
                                                                                                            // 17
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-notifications'] = {
  Herald: Herald,
  buildEmailNotification: buildEmailNotification,
  getUnsubscribeLink: getUnsubscribeLink
};

})();

//# sourceMappingURL=telescope-notifications.js.map
