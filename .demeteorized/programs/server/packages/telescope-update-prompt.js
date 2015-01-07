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
var HTTP = Package.http.HTTP;

/* Package-scope variables */
var compareVersions;

(function () {

//////////////////////////////////////////////////////////////////////////////////
//                                                                              //
// packages/telescope-update-prompt/lib/server/phone_home.js                    //
//                                                                              //
//////////////////////////////////////////////////////////////////////////////////
                                                                                //
Meteor.methods({                                                                // 1
  phoneHome: function  () {                                                     // 2
                                                                                // 3
    var url = 'http://version.telescopeapp.org/';                               // 4
                                                                                // 5
    var params = {                                                              // 6
      currentVersion: telescopeVersion,                                         // 7
      siteTitle: getSetting('title'),                                           // 8
      siteUrl: getSiteUrl(),                                                    // 9
      users: Meteor.users.find().count(),                                       // 10
      posts: Posts.find().count(),                                              // 11
      comments: Comments.find().count()                                         // 12
    }                                                                           // 13
                                                                                // 14
    if(Meteor.user() && isAdmin(Meteor.user())){                                // 15
                                                                                // 16
      this.unblock();                                                           // 17
      try {                                                                     // 18
        var result = HTTP.get(url, {                                            // 19
          params: params                                                        // 20
        })                                                                      // 21
        return result;                                                          // 22
      } catch (e) {                                                             // 23
        // Got a network error, time-out or HTTP error in the 400 or 500 range. // 24
        return false;                                                           // 25
      }                                                                         // 26
    }                                                                           // 27
  }                                                                             // 28
})                                                                              // 29
//////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-update-prompt'] = {
  compareVersions: compareVersions
};

})();

//# sourceMappingURL=telescope-update-prompt.js.map
