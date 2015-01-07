(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var Gravatar = Package['jparker:gravatar'].Gravatar;

/* Package-scope variables */
var Avatar, getService, getGravatarUrl, getEmailOrHash;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/bengott:avatar/export.js                                                            //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
// Avatar object to be exported                                                                 // 1
Avatar = {                                                                                      // 2
                                                                                                // 3
  // If defined (e.g. from a startup config file in your app), these options                    // 4
  // override default functionality                                                             // 5
  options: {                                                                                    // 6
                                                                                                // 7
    // This property on the user object will be used for retrieving gravatars                   // 8
    // (useful when user emails are not published).                                             // 9
    emailHashProperty: '',                                                                      // 10
                                                                                                // 11
    // What to show when no avatar can be found via linked services:                            // 12
    // 'initials' (default) or 'image'                                                          // 13
    defaultType: '',                                                                            // 14
                                                                                                // 15
    // This will replace the included default avatar image's URL                                // 16
    // ('packages/bengott_avatar/default.png'). It can be a relative path                       // 17
    // (relative to website's base URL, e.g. 'images/defaultAvatar.png').                       // 18
    defaultImageUrl: '',                                                                        // 19
                                                                                                // 20
    // Gravatar default option to use (overrides default image URL)                             // 21
    // Options are available at:                                                                // 22
    // https://secure.gravatar.com/site/implement/images/#default-image                         // 23
    gravatarDefault: ''                                                                         // 24
  },                                                                                            // 25
                                                                                                // 26
  // Get the initials of the user                                                               // 27
  getInitials: function (user) {                                                                // 28
                                                                                                // 29
    var initials = '';                                                                          // 30
    var parts = [];                                                                             // 31
                                                                                                // 32
    if (user && user.profile && user.profile.firstName) {                                       // 33
      initials = user.profile.firstName.charAt(0).toUpperCase();                                // 34
                                                                                                // 35
      if (user.profile.lastName) {                                                              // 36
        initials += user.profile.lastName.charAt(0).toUpperCase();                              // 37
      }                                                                                         // 38
      else if (user.profile.familyName) {                                                       // 39
        initials += user.profile.familyName.charAt(0).toUpperCase();                            // 40
      }                                                                                         // 41
      else if (user.profile.secondName) {                                                       // 42
        initials += user.profile.secondName.charAt(0).toUpperCase();                            // 43
      }                                                                                         // 44
    }                                                                                           // 45
    else if (user && user.profile && user.profile.name) {                                       // 46
      parts = user.profile.name.split(' ');                                                     // 47
      // Limit getInitials to first and last initial to avoid problems with                     // 48
      // very long multi-part names (e.g. "Jose Manuel Garcia Galvez")                          // 49
      initials = _.first(parts).charAt(0).toUpperCase();                                        // 50
      if (parts.length > 1) {                                                                   // 51
        initials += _.last(parts).charAt(0).toUpperCase();                                      // 52
      }                                                                                         // 53
    }                                                                                           // 54
                                                                                                // 55
    return initials;                                                                            // 56
  },                                                                                            // 57
                                                                                                // 58
  // Get the url of the user's avatar                                                           // 59
  getUrl: function (user) {                                                                     // 60
                                                                                                // 61
    var defaultUrl = Avatar.options.defaultImageUrl || 'packages/bengott_avatar/default.png';   // 62
    // If it's a relative path (no '//' anywhere), complete the URL                             // 63
    if (defaultUrl.indexOf('//') === -1) {                                                      // 64
      // Strip starting slash if it exists                                                      // 65
      if (defaultUrl.charAt(0) === '/') defaultUrl = defaultUrl.slice(1);                       // 66
      // Then add the relative path to the server's base URL                                    // 67
      defaultUrl = Meteor.absoluteUrl() + defaultUrl;                                           // 68
    }                                                                                           // 69
                                                                                                // 70
    var url = '';                                                                               // 71
    var svc = getService(user);                                                                 // 72
    if (svc === 'twitter') {                                                                    // 73
      // use larger image (200x200 is smallest custom option)                                   // 74
      url = user.services.twitter.profile_image_url.replace('_normal.', '_200x200.');           // 75
    }                                                                                           // 76
    else if (svc === 'facebook') {                                                              // 77
      // use larger image (~200x200)                                                            // 78
      url = 'http://graph.facebook.com/' + user.services.facebook.id + '/picture?type=large';   // 79
    }                                                                                           // 80
    else if (svc === 'google') {                                                                // 81
      url = user.services.google.picture;                                                       // 82
    }                                                                                           // 83
    else if (svc === 'github') {                                                                // 84
      url = 'http://avatars.githubusercontent.com/' + user.services.github.username + '?s=200'; // 85
    }                                                                                           // 86
    else if (svc === 'instagram') {                                                             // 87
      url = user.services.instagram.profile_picture;                                            // 88
    }                                                                                           // 89
    else if (svc === 'none') {                                                                  // 90
      url = getGravatarUrl(user, defaultUrl);                                                   // 91
    }                                                                                           // 92
    return url;                                                                                 // 93
  }                                                                                             // 94
};                                                                                              // 95
                                                                                                // 96
//////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/bengott:avatar/helpers.js                                                           //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
// Get the account service to use for the user's avatar                                         // 1
// Priority: Twitter > Facebook > Google > GitHub > Instagram                                   // 2
getService = function (user) {                                                                  // 3
  if      (user && user.services && user.services.twitter)   { return 'twitter'; }              // 4
  else if (user && user.services && user.services.facebook)  { return 'facebook'; }             // 5
  else if (user && user.services && user.services.google)    { return 'google'; }               // 6
  else if (user && user.services && user.services.github)    { return 'github'; }               // 7
  else if (user && user.services && user.services.instagram) { return 'instagram'; }            // 8
  else                                                       { return 'none'; }                 // 9
};                                                                                              // 10
                                                                                                // 11
getGravatarUrl = function (user, defaultUrl) {                                                  // 12
  var gravatarDefault;                                                                          // 13
  var validGravatars = ['404', 'mm', 'identicon', 'monsterid', 'wavatar', 'retro', 'blank'];    // 14
                                                                                                // 15
  // Initials are shown when Gravatar returns 404. Therefore, pass '404'                        // 16
  // as the gravatarDefault unless defaultType is image.                                        // 17
  if (Avatar.options.defaultType === 'image') {                                                 // 18
    var valid = _.contains(validGravatars, Avatar.options.gravatarDefault);                     // 19
    gravatarDefault = valid ? Avatar.options.gravatarDefault : defaultUrl;                      // 20
  }                                                                                             // 21
  else {                                                                                        // 22
    gravatarDefault = '404';                                                                    // 23
  }                                                                                             // 24
                                                                                                // 25
  var options = {                                                                               // 26
    // NOTE: Gravatar's default option requires a publicly accessible URL,                      // 27
    // so it won't work when your app is running on localhost and you're                        // 28
    // using an image with either the standard default image URL or a custom                    // 29
    // defaultImageUrl that is a relative path (e.g. 'images/defaultAvatar.png').               // 30
    default: gravatarDefault,                                                                   // 31
    size: 200, // use 200x200 like twitter and facebook above (might be useful later)           // 32
    secure: Meteor.absoluteUrl().slice(0,6) === 'https:'                                        // 33
  };                                                                                            // 34
                                                                                                // 35
  var emailOrHash = getEmailOrHash(user);                                                       // 36
  return Gravatar.imageUrl(emailOrHash, options);                                               // 37
};                                                                                              // 38
                                                                                                // 39
// Get the user's email address or (if the emailHashProperty is defined) hash                   // 40
getEmailOrHash = function (user) {                                                              // 41
  var emailOrHash;                                                                              // 42
  if (Avatar.options.emailHashProperty) {                                                       // 43
    emailOrHash = user[Avatar.options.emailHashProperty];                                       // 44
  }                                                                                             // 45
  else if (user && user.emails) {                                                               // 46
    emailOrHash = user.emails[0].address; // TODO: try all emails                               // 47
  }                                                                                             // 48
  else {                                                                                        // 49
    // If all else fails, return 32 zeros (trash hash, hehe) so that Gravatar                   // 50
    // has something to build a URL with at least.                                              // 51
    emailOrHash = '00000000000000000000000000000000';                                           // 52
  }                                                                                             // 53
  return emailOrHash;                                                                           // 54
};                                                                                              // 55
                                                                                                // 56
//////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['bengott:avatar'] = {
  Avatar: Avatar
};

})();

//# sourceMappingURL=bengott_avatar.js.map
