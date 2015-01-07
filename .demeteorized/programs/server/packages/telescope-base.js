(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var i18n = Package['telescope-i18n'].i18n;
var setLanguage = Package['telescope-i18n'].setLanguage;
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
var adminNav, viewNav, addToPostSchema, addToCommentsSchema, addToSettingsSchema, preloadSubscriptions, primaryNav, secondaryNav, viewParameters, footerModules, heroModules, postModules, postHeading, postMeta, modulePositions, postSubmitRenderedCallbacks, postSubmitClientCallbacks, postSubmitMethodCallbacks, postAfterSubmitMethodCallbacks, postEditRenderedCallbacks, postEditClientCallbacks, postEditMethodCallbacks, postAfterEditMethodCallbacks, commentSubmitRenderedCallbacks, commentSubmitClientCallbacks, commentSubmitMethodCallbacks, commentAfterSubmitMethodCallbacks, commentEditRenderedCallbacks, commentEditClientCallbacks, commentEditMethodCallbacks, commentAfterEditMethodCallbacks, getTemplate, templates, themeSettings, postAfterMethodCallbacks;

(function () {

//////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                          //
// packages/telescope-base/lib/base.js                                                      //
//                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////
                                                                                            //
// ------------------------------------- Schemas -------------------------------- //        // 1
                                                                                            // 2
// array containing properties to be added to the post/settings/comments schema on startup. // 3
addToPostSchema = [];                                                                       // 4
addToCommentsSchema = [];                                                                   // 5
addToSettingsSchema = [];                                                                   // 6
                                                                                            // 7
// ------------------------------------- Navigation -------------------------------- //     // 8
                                                                                            // 9
                                                                                            // 10
// array containing nav items; initialize with views menu and admin menu                    // 11
primaryNav = ['viewsMenu', 'adminMenu'];                                                    // 12
                                                                                            // 13
secondaryNav = ['userMenu', 'notificationsMenu', 'submitButton'];                           // 14
                                                                                            // 15
// array containing items in the admin menu                                                 // 16
adminNav = [];                                                                              // 17
                                                                                            // 18
// array containing items in the views menu                                                 // 19
viewNav = [                                                                                 // 20
  {                                                                                         // 21
    route: 'posts_top',                                                                     // 22
    label: 'top'                                                                            // 23
  },                                                                                        // 24
  {                                                                                         // 25
    route: 'posts_new',                                                                     // 26
    label: 'new'                                                                            // 27
  },                                                                                        // 28
  {                                                                                         // 29
    route: 'posts_best',                                                                    // 30
    label: 'best'                                                                           // 31
  },                                                                                        // 32
  {                                                                                         // 33
    route: 'posts_digest_default',                                                          // 34
    label: 'digest'                                                                         // 35
  }                                                                                         // 36
];                                                                                          // 37
                                                                                            // 38
// ------------------------------------- Views -------------------------------- //          // 39
                                                                                            // 40
                                                                                            // 41
// object containing post list view parameters                                              // 42
viewParameters = {}                                                                         // 43
                                                                                            // 44
viewParameters.top = function (terms) {                                                     // 45
  return {                                                                                  // 46
    options: {sort: {sticky: -1, score: -1}}                                                // 47
  };                                                                                        // 48
}                                                                                           // 49
                                                                                            // 50
viewParameters.new = function (terms) {                                                     // 51
  return {                                                                                  // 52
    options: {sort: {sticky: -1, postedAt: -1}}                                             // 53
  };                                                                                        // 54
}                                                                                           // 55
                                                                                            // 56
viewParameters.best = function (terms) {                                                    // 57
  return {                                                                                  // 58
    options: {sort: {sticky: -1, baseScore: -1}}                                            // 59
  };                                                                                        // 60
}                                                                                           // 61
                                                                                            // 62
viewParameters.pending = function (terms) {                                                 // 63
  return {                                                                                  // 64
    find: {                                                                                 // 65
      status: 1,                                                                            // 66
      postedAt: {$lte: null}                                                                // 67
    },                                                                                      // 68
    options: {sort: {createdAt: -1}}                                                        // 69
  };                                                                                        // 70
}                                                                                           // 71
                                                                                            // 72
viewParameters.digest = function (terms) {                                                  // 73
  return {                                                                                  // 74
    find: {                                                                                 // 75
      postedAt: {                                                                           // 76
        $gte: terms.after,                                                                  // 77
        $lt: terms.before                                                                   // 78
      }                                                                                     // 79
    },                                                                                      // 80
    options: {                                                                              // 81
      sort: {sticky: -1, baseScore: -1, limit: 0}                                           // 82
    }                                                                                       // 83
  };                                                                                        // 84
}                                                                                           // 85
                                                                                            // 86
                                                                                            // 87
heroModules = [];                                                                           // 88
                                                                                            // 89
footerModules = [];                                                                         // 90
                                                                                            // 91
// array containing post modules                                                            // 92
modulePositions = [                                                                         // 93
  'left-left',                                                                              // 94
  'left-center',                                                                            // 95
  'left-right',                                                                             // 96
  'center-left',                                                                            // 97
  'center-center',                                                                          // 98
  'center-right',                                                                           // 99
  'right-left',                                                                             // 100
  'right-center',                                                                           // 101
  'right-right'                                                                             // 102
];                                                                                          // 103
                                                                                            // 104
postModules = [                                                                             // 105
  {                                                                                         // 106
    template: 'postUpvote',                                                                 // 107
    position: 'left-left'                                                                   // 108
  },                                                                                        // 109
  {                                                                                         // 110
    template: 'postActions',                                                                // 111
    position: 'left-right'                                                                  // 112
  },                                                                                        // 113
  {                                                                                         // 114
    template: 'postContent',                                                                // 115
    position: 'center-center'                                                               // 116
  },                                                                                        // 117
  {                                                                                         // 118
    template: 'postDiscuss',                                                                // 119
    position: 'right-right'                                                                 // 120
  }                                                                                         // 121
];                                                                                          // 122
                                                                                            // 123
postHeading = [                                                                             // 124
  {                                                                                         // 125
    template: 'postTitle',                                                                  // 126
    order: 1                                                                                // 127
  },                                                                                        // 128
  {                                                                                         // 129
    template: 'postDomain',                                                                 // 130
    order: 5                                                                                // 131
  }                                                                                         // 132
]                                                                                           // 133
                                                                                            // 134
postMeta = [                                                                                // 135
  {                                                                                         // 136
    template: 'postInfo',                                                                   // 137
    order: 1                                                                                // 138
  },                                                                                        // 139
  {                                                                                         // 140
    template: 'postCommentsLink',                                                           // 141
    order: 3                                                                                // 142
  },                                                                                        // 143
  {                                                                                         // 144
    template: 'postAdmin',                                                                  // 145
    order: 5                                                                                // 146
  }                                                                                         // 147
]                                                                                           // 148
// ------------------------------ Callbacks ------------------------------ //               // 149
                                                                                            // 150
postSubmitRenderedCallbacks = [];                                                           // 151
postSubmitClientCallbacks = [];                                                             // 152
postSubmitMethodCallbacks = [];                                                             // 153
postAfterSubmitMethodCallbacks = [];                                                        // 154
                                                                                            // 155
postEditRenderedCallbacks = [];                                                             // 156
postEditClientCallbacks = [];                                                               // 157
postEditMethodCallbacks = []; // not used yet                                               // 158
postAfterMethodCallbacks = []; // not used yet                                              // 159
                                                                                            // 160
commentSubmitRenderedCallbacks = [];                                                        // 161
commentSubmitClientCallbacks = [];                                                          // 162
commentSubmitMethodCallbacks = [];                                                          // 163
commentAfterSubmitMethodCallbacks = [];                                                     // 164
                                                                                            // 165
commentEditRenderedCallbacks = [];                                                          // 166
commentEditClientCallbacks = [];                                                            // 167
commentEditMethodCallbacks = []; // not used yet                                            // 168
commentAfterEditMethodCallbacks = []; // not used yet                                       // 169
                                                                                            // 170
// ------------------------------ Dynamic Templates ------------------------------ //       // 171
                                                                                            // 172
                                                                                            // 173
templates = {}                                                                              // 174
                                                                                            // 175
getTemplate = function (name) {                                                             // 176
  // if template has been overwritten, return this; else return template name               // 177
  return !!templates[name] ? templates[name] : name;                                        // 178
}                                                                                           // 179
                                                                                            // 180
// ------------------------------ Theme Settings ------------------------------ //          // 181
                                                                                            // 182
themeSettings = {                                                                           // 183
  'useDropdowns': true // whether or not to use dropdown menus in a theme                   // 184
};                                                                                          // 185
                                                                                            // 186
// ------------------------------ Subscriptions ------------------------------ //           // 187
                                                                                            // 188
// array containing subscriptions to be preloaded                                           // 189
preloadSubscriptions = [];                                                                  // 190
//////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                          //
// packages/telescope-base/lib/base_server.js                                               //
//                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////
                                                                                            //
                                                                                            // 1
//////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-base'] = {
  adminNav: adminNav,
  viewNav: viewNav,
  addToPostSchema: addToPostSchema,
  addToCommentsSchema: addToCommentsSchema,
  addToSettingsSchema: addToSettingsSchema,
  preloadSubscriptions: preloadSubscriptions,
  primaryNav: primaryNav,
  secondaryNav: secondaryNav,
  viewParameters: viewParameters,
  footerModules: footerModules,
  heroModules: heroModules,
  postModules: postModules,
  postHeading: postHeading,
  postMeta: postMeta,
  modulePositions: modulePositions,
  postSubmitRenderedCallbacks: postSubmitRenderedCallbacks,
  postSubmitClientCallbacks: postSubmitClientCallbacks,
  postSubmitMethodCallbacks: postSubmitMethodCallbacks,
  postAfterSubmitMethodCallbacks: postAfterSubmitMethodCallbacks,
  postEditRenderedCallbacks: postEditRenderedCallbacks,
  postEditClientCallbacks: postEditClientCallbacks,
  postEditMethodCallbacks: postEditMethodCallbacks,
  postAfterEditMethodCallbacks: postAfterEditMethodCallbacks,
  commentSubmitRenderedCallbacks: commentSubmitRenderedCallbacks,
  commentSubmitClientCallbacks: commentSubmitClientCallbacks,
  commentSubmitMethodCallbacks: commentSubmitMethodCallbacks,
  commentAfterSubmitMethodCallbacks: commentAfterSubmitMethodCallbacks,
  commentEditRenderedCallbacks: commentEditRenderedCallbacks,
  commentEditClientCallbacks: commentEditClientCallbacks,
  commentEditMethodCallbacks: commentEditMethodCallbacks,
  commentAfterEditMethodCallbacks: commentAfterEditMethodCallbacks,
  getTemplate: getTemplate,
  templates: templates,
  themeSettings: themeSettings
};

})();

//# sourceMappingURL=telescope-base.js.map
