(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
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

/* Package-scope variables */
var serveRSS, servePostRSS, serveCommentRSS, post;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-rss/lib/server/rss.js                                                                       //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var RSS = Npm.require('rss');                                                                                     // 1
                                                                                                                  // 2
var getMeta = function() {                                                                                        // 3
  return {                                                                                                        // 4
    title: getSetting('title'),                                                                                   // 5
    description: getSetting('tagline'),                                                                           // 6
    feed_url: Meteor.absoluteUrl()+'feed.xml',                                                                    // 7
    site_url: Meteor.absoluteUrl(),                                                                               // 8
    image_url: Meteor.absoluteUrl()+'img/favicon.png',                                                            // 9
  };                                                                                                              // 10
};                                                                                                                // 11
                                                                                                                  // 12
servePostRSS = function() {                                                                                       // 13
  var feed = new RSS(getMeta());                                                                                  // 14
                                                                                                                  // 15
  Posts.find(getPostsParameters({}).find, {sort: {postedAt: -1}, limit: 20}).forEach(function(post) {             // 16
    var description = !!post.body ? post.body+'</br></br>' : '';                                                  // 17
    feed.item({                                                                                                   // 18
     title: post.title,                                                                                           // 19
     description: description+'<a href="'+getPostUrl(post._id)+'">Discuss</a>',                                   // 20
     author: post.author,                                                                                         // 21
     date: post.postedAt,                                                                                         // 22
     url: getPostLink(post),                                                                                      // 23
     guid: post._id                                                                                               // 24
    });                                                                                                           // 25
  });                                                                                                             // 26
                                                                                                                  // 27
  return feed.xml();                                                                                              // 28
};                                                                                                                // 29
                                                                                                                  // 30
serveCommentRSS = function() {                                                                                    // 31
  var feed = new RSS(getMeta());                                                                                  // 32
                                                                                                                  // 33
  Comments.find({isDeleted: {$ne: true}}, {sort: {postedAt: -1}, limit: 20}).forEach(function(comment) {          // 34
    post = Posts.findOne(comment.postId);                                                                         // 35
    feed.item({                                                                                                   // 36
     title: 'Comment on '+post.title,                                                                             // 37
     description: comment.body+'</br></br>'+'<a href="'+getPostCommentUrl(post._id, comment._id)+'">Discuss</a>', // 38
     author: comment.author,                                                                                      // 39
     date: comment.postedAt,                                                                                      // 40
     url: getCommentUrl(comment._id),                                                                             // 41
     guid: comment._id                                                                                            // 42
    });                                                                                                           // 43
  });                                                                                                             // 44
                                                                                                                  // 45
  return feed.xml();                                                                                              // 46
};                                                                                                                // 47
                                                                                                                  // 48
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-rss/lib/server/routes.js                                                                    //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
Meteor.startup(function () {                                                                                      // 1
                                                                                                                  // 2
  // Post RSS                                                                                                     // 3
                                                                                                                  // 4
  Router.route('/feed.xml', {                                                                                     // 5
    name: 'feed',                                                                                                 // 6
    where: 'server',                                                                                              // 7
    action: function() {                                                                                          // 8
      this.response.write(servePostRSS());                                                                        // 9
      this.response.end();                                                                                        // 10
    }                                                                                                             // 11
  });                                                                                                             // 12
                                                                                                                  // 13
  // Comment RSS                                                                                                  // 14
                                                                                                                  // 15
  Router.route('/rss/comments.xml', {                                                                             // 16
    name: 'rss_comments',                                                                                         // 17
    where: 'server',                                                                                              // 18
    action: function() {                                                                                          // 19
      this.response.write(serveCommentRSS());                                                                     // 20
      this.response.end();                                                                                        // 21
    }                                                                                                             // 22
  });                                                                                                             // 23
                                                                                                                  // 24
});                                                                                                               // 25
                                                                                                                  // 26
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-rss'] = {
  serveRSS: serveRSS
};

})();

//# sourceMappingURL=telescope-rss.js.map
