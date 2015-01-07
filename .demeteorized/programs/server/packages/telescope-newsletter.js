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
var Router = Package['iron:router'].Router;
var RouteController = Package['iron:router'].RouteController;
var MailChimpAPI = Package['mrt:mailchimp'].MailChimpAPI;
var MailChimp = Package['mrt:mailchimp'].MailChimp;
var MailChimpOptions = Package['mrt:mailchimp'].MailChimpOptions;
var TAPi18next = Package['tap:i18n'].TAPi18next;
var TAPi18n = Package['tap:i18n'].TAPi18n;
var SyncedCron = Package['percolatestudio:synced-cron'].SyncedCron;
var Handlebars = Package['cmather:handlebars-server'].Handlebars;
var OriginalHandlebars = Package['cmather:handlebars-server'].OriginalHandlebars;
var Iron = Package['iron:core'].Iron;
var Async = Package['meteorhacks:async'].Async;

/* Package-scope variables */
var __, campaignSchema, Campaigns, defaultFrequency, defaultPosts, getCampaignPosts, buildCampaign, scheduleNextCampaign, Later, getSchedule, getNextCampaignSchedule, scheduleCampaign, addToMailChimpList, syncAddToMailChimpList, Handlebars;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-newsletter/package-i18n.js                                                                  //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
TAPi18n.packages["telescope-newsletter"] = {"translation_function_name":"__","helper_name":"_","namespace":"telescope-newsletter"};
                                                                                                                  // 2
// define package's translation function (proxy to the i18next)                                                   // 3
__ = TAPi18n._getPackageI18nextProxy("telescope-newsletter");                                                     // 4
                                                                                                                  // 5
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-newsletter/lib/newsletter.js                                                                //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
campaignSchema = new SimpleSchema({                                                                               // 1
 _id: {                                                                                                           // 2
    type: String,                                                                                                 // 3
    optional: true                                                                                                // 4
  },                                                                                                              // 5
  createdAt: {                                                                                                    // 6
    type: Date,                                                                                                   // 7
    optional: true                                                                                                // 8
  },                                                                                                              // 9
  sentAt: {                                                                                                       // 10
    type: String,                                                                                                 // 11
    optional: true                                                                                                // 12
  },                                                                                                              // 13
  status: {                                                                                                       // 14
    type: String,                                                                                                 // 15
    optional: true                                                                                                // 16
  },                                                                                                              // 17
  posts: {                                                                                                        // 18
    type: [String],                                                                                               // 19
    optional: true                                                                                                // 20
  },                                                                                                              // 21
  webHits: {                                                                                                      // 22
    type: Number,                                                                                                 // 23
    optional: true                                                                                                // 24
  },                                                                                                              // 25
});                                                                                                               // 26
                                                                                                                  // 27
Campaigns = new Meteor.Collection("campaigns", {                                                                  // 28
  schema: campaignSchema                                                                                          // 29
});                                                                                                               // 30
                                                                                                                  // 31
addToPostSchema.push(                                                                                             // 32
  {                                                                                                               // 33
    propertyName: 'scheduledAt',                                                                                  // 34
    propertySchema: {                                                                                             // 35
      type: Date,                                                                                                 // 36
      optional: true                                                                                              // 37
    }                                                                                                             // 38
  }                                                                                                               // 39
);                                                                                                                // 40
                                                                                                                  // 41
// Settings                                                                                                       // 42
                                                                                                                  // 43
// note for next two fields: need to add a way to tell app not to publish field to client except for admins       // 44
                                                                                                                  // 45
var showBanner = {                                                                                                // 46
  propertyName: 'showBanner',                                                                                     // 47
  propertySchema: {                                                                                               // 48
    type: Boolean,                                                                                                // 49
    optional: true,                                                                                               // 50
    label: 'Newsletter banner',                                                                                   // 51
    autoform: {                                                                                                   // 52
      group: 'newsletter',                                                                                        // 53
      instructions: 'Show newsletter sign-up form on the front page.'                                             // 54
    }                                                                                                             // 55
  }                                                                                                               // 56
}                                                                                                                 // 57
addToSettingsSchema.push(showBanner);                                                                             // 58
                                                                                                                  // 59
var mailChimpAPIKey = {                                                                                           // 60
  propertyName: 'mailChimpAPIKey',                                                                                // 61
  propertySchema: {                                                                                               // 62
    type: String,                                                                                                 // 63
    optional: true,                                                                                               // 64
    autoform: {                                                                                                   // 65
      group: 'newsletter'                                                                                         // 66
    }                                                                                                             // 67
  }                                                                                                               // 68
}                                                                                                                 // 69
addToSettingsSchema.push(mailChimpAPIKey);                                                                        // 70
                                                                                                                  // 71
var mailChimpListId = {                                                                                           // 72
  propertyName: 'mailChimpListId',                                                                                // 73
  propertySchema: {                                                                                               // 74
    type: String,                                                                                                 // 75
    optional: true,                                                                                               // 76
    autoform: {                                                                                                   // 77
      group: 'newsletter',                                                                                        // 78
      instructions: 'The ID of the list you want to send to.'                                                     // 79
    }                                                                                                             // 80
  }                                                                                                               // 81
}                                                                                                                 // 82
addToSettingsSchema.push(mailChimpListId);                                                                        // 83
                                                                                                                  // 84
var postsPerNewsletter = {                                                                                        // 85
  propertyName: 'postsPerNewsletter',                                                                             // 86
  propertySchema: {                                                                                               // 87
    type: Number,                                                                                                 // 88
    optional: true,                                                                                               // 89
    autoform: {                                                                                                   // 90
      group: 'newsletter'                                                                                         // 91
    }                                                                                                             // 92
  }                                                                                                               // 93
}                                                                                                                 // 94
addToSettingsSchema.push(postsPerNewsletter);                                                                     // 95
                                                                                                                  // 96
var newsletterFrequency = {                                                                                       // 97
  propertyName: 'newsletterFrequency',                                                                            // 98
  propertySchema: {                                                                                               // 99
    type: Number,                                                                                                 // 100
    optional: true,                                                                                               // 101
    autoform: {                                                                                                   // 102
      group: 'newsletter',                                                                                        // 103
      instructions: 'Changes require restarting your app to take effect.',                                        // 104
      options: [                                                                                                  // 105
        {                                                                                                         // 106
          value: 1,                                                                                               // 107
          label: 'Every Day'                                                                                      // 108
        },                                                                                                        // 109
        {                                                                                                         // 110
          value: 2,                                                                                               // 111
          label: 'Mondays, Wednesdays, Fridays'                                                                   // 112
        },                                                                                                        // 113
        {                                                                                                         // 114
          value: 3,                                                                                               // 115
          label: 'Mondays & Thursdays'                                                                            // 116
        },                                                                                                        // 117
        {                                                                                                         // 118
          value: 7,                                                                                               // 119
          label: 'Once a week (Mondays)'                                                                          // 120
        },                                                                                                        // 121
        {                                                                                                         // 122
          value: 0,                                                                                               // 123
          label: "Don't send newsletter"                                                                          // 124
        }                                                                                                         // 125
      ]                                                                                                           // 126
    }                                                                                                             // 127
  }                                                                                                               // 128
}                                                                                                                 // 129
addToSettingsSchema.push(newsletterFrequency);                                                                    // 130
                                                                                                                  // 131
// create new "campaign" lens for all posts from the past X days that haven't been scheduled yet                  // 132
viewParameters.campaign = function (terms) {                                                                      // 133
  return {                                                                                                        // 134
    find: {                                                                                                       // 135
      scheduledAt: {$exists: false},                                                                              // 136
      postedAt: {                                                                                                 // 137
        $gte: terms.after                                                                                         // 138
      }                                                                                                           // 139
    },                                                                                                            // 140
    options: {sort: {sticky: -1, score: -1}}                                                                      // 141
  };                                                                                                              // 142
}                                                                                                                 // 143
                                                                                                                  // 144
heroModules.push({                                                                                                // 145
  template: 'newsletterBanner'                                                                                    // 146
});                                                                                                               // 147
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-newsletter/lib/server/campaign.js                                                           //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
defaultFrequency = 7;                                                                                             // 1
defaultPosts = 5;                                                                                                 // 2
                                                                                                                  // 3
getCampaignPosts = function (postsCount) {                                                                        // 4
                                                                                                                  // 5
  var newsletterFrequency = getSetting('newsletterFrequency', defaultFrequency);                                  // 6
                                                                                                                  // 7
  // look for last scheduled campaign in the database                                                             // 8
  var lastCampaign = SyncedCron._collection.findOne({name: 'Schedule newsletter'}, {sort: {finishedAt: -1}, limit: 1});
                                                                                                                  // 10
  // if there is a last campaign use its date, else default to posts from the last 7 days                         // 11
  var lastWeek = moment().subtract(7, 'days').toDate();                                                           // 12
  var after = (typeof lastCampaign != 'undefined') ? lastCampaign.finishedAt : lastWeek                           // 13
                                                                                                                  // 14
  var params = getPostsParameters({                                                                               // 15
    view: 'campaign',                                                                                             // 16
    limit: postsCount,                                                                                            // 17
    after: after                                                                                                  // 18
  });                                                                                                             // 19
  return Posts.find(params.find, params.options).fetch();                                                         // 20
}                                                                                                                 // 21
                                                                                                                  // 22
buildCampaign = function (postsArray) {                                                                           // 23
  var postsHTML = '', subject = '';                                                                               // 24
                                                                                                                  // 25
  // 1. Iterate through posts and pass each of them through a handlebars template                                 // 26
  postsArray.forEach(function (post, index) {                                                                     // 27
    if(index > 0)                                                                                                 // 28
      subject += ', ';                                                                                            // 29
                                                                                                                  // 30
    subject += post.title;                                                                                        // 31
                                                                                                                  // 32
    var postUser = Meteor.users.findOne(post.userId);                                                             // 33
                                                                                                                  // 34
    // the naked post object as stored in the database is missing a few properties, so let's add them             // 35
    var properties = _.extend(post, {                                                                             // 36
      authorName: getAuthorName(post),                                                                            // 37
      postLink: getPostLink(post),                                                                                // 38
      profileUrl: getProfileUrl(postUser),                                                                        // 39
      postPageLink: getPostPageUrl(post),                                                                         // 40
      date: moment(post.postedAt).format("MMMM D YYYY")                                                           // 41
    });                                                                                                           // 42
                                                                                                                  // 43
    if (post.body)                                                                                                // 44
      properties.body = marked(trimWords(post.body, 20)).replace('<p>', '').replace('</p>', ''); // remove p tags // 45
                                                                                                                  // 46
    if(post.url)                                                                                                  // 47
      properties.domain = getDomain(post.url)                                                                     // 48
                                                                                                                  // 49
    postsHTML += getEmailTemplate('emailPostItem')(properties);                                                   // 50
  });                                                                                                             // 51
                                                                                                                  // 52
  // 2. Wrap posts HTML in digest template                                                                        // 53
  var digestHTML = getEmailTemplate('emailDigest')({                                                              // 54
    siteName: getSetting('title'),                                                                                // 55
    date: moment().format("dddd, MMMM Do YYYY"),                                                                  // 56
    content: postsHTML                                                                                            // 57
  });                                                                                                             // 58
                                                                                                                  // 59
  // 3. wrap digest HTML in email wrapper tempalte                                                                // 60
  var emailHTML = buildEmailTemplate(digestHTML);                                                                 // 61
                                                                                                                  // 62
  return {                                                                                                        // 63
    postIds: _.pluck(postsArray, '_id'),                                                                          // 64
    subject: trimWords(subject, 15),                                                                              // 65
    html: emailHTML                                                                                               // 66
  }                                                                                                               // 67
}                                                                                                                 // 68
                                                                                                                  // 69
scheduleNextCampaign = function (isTest) {                                                                        // 70
  var isTest = typeof isTest === 'undefined' ? false : isTest;                                                    // 71
  var posts = getCampaignPosts(getSetting('postsPerNewsletter', defaultPosts));                                   // 72
  if(!!posts.length){                                                                                             // 73
    return scheduleCampaign(buildCampaign(posts), isTest);                                                        // 74
  }else{                                                                                                          // 75
    var result = 'No posts to schedule today…';                                                                   // 76
    return result                                                                                                 // 77
  }                                                                                                               // 78
}                                                                                                                 // 79
                                                                                                                  // 80
Meteor.methods({                                                                                                  // 81
  testCampaign: function () {                                                                                     // 82
    if(isAdminById(this.userId))                                                                                  // 83
      scheduleNextCampaign(true);                                                                                 // 84
  }                                                                                                               // 85
});                                                                                                               // 86
                                                                                                                  // 87
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-newsletter/lib/server/cron.js                                                               //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
Later = Npm.require('later');                                                                                     // 1
                                                                                                                  // 2
defaultFrequency = 7; // once a week                                                                              // 3
                                                                                                                  // 4
getSchedule = function (parser) {                                                                                 // 5
  var frequency = getSetting('newsletterFrequency', defaultFrequency);                                            // 6
  switch (frequency) {                                                                                            // 7
    case 1: // every day                                                                                          // 8
    // sched = {schedules: [{dw: [1,2,3,4,5,6,0]}]};                                                              // 9
    return parser.recur().on(1,2,3,4,5,6,0).dayOfWeek();                                                          // 10
                                                                                                                  // 11
    case 2: // Mondays, Wednesdays, Fridays                                                                       // 12
    // sched = {schedules: [{dw: [2,4,6]}]};                                                                      // 13
    return parser.recur().on(2,4,6).dayOfWeek();                                                                  // 14
                                                                                                                  // 15
    case 3: // Mondays, Thursdays                                                                                 // 16
    // sched = {schedules: [{dw: [2,5]}]};                                                                        // 17
    return parser.recur().on(2,5).dayOfWeek();                                                                    // 18
                                                                                                                  // 19
    case 7: // Once a week (Mondays)                                                                              // 20
    // sched = {schedules: [{dw: [2]}]};                                                                          // 21
    return parser.recur().on(2).dayOfWeek();                                                                      // 22
                                                                                                                  // 23
    default: // Don't send                                                                                        // 24
    return null;                                                                                                  // 25
  }                                                                                                               // 26
}                                                                                                                 // 27
                                                                                                                  // 28
SyncedCron.getNext = function (jobName) {                                                                         // 29
  var scheduledAt;                                                                                                // 30
  try {                                                                                                           // 31
    _.some(this._entries, function(entry) {                                                                       // 32
      if(entry.name === jobName){                                                                                 // 33
        var schedule = entry.schedule(Later.parse);                                                               // 34
        scheduledAt = Later.schedule(schedule).next(1);                                                           // 35
        return true;                                                                                              // 36
      }                                                                                                           // 37
    });                                                                                                           // 38
  }                                                                                                               // 39
  catch (error) {                                                                                                 // 40
    console.log(error)                                                                                            // 41
    scheduledAt = 'No job scheduled';                                                                             // 42
  }                                                                                                               // 43
  return scheduledAt;                                                                                             // 44
}                                                                                                                 // 45
                                                                                                                  // 46
getNextCampaignSchedule = function () {                                                                           // 47
  return SyncedCron.getNext('Schedule newsletter');                                                               // 48
}                                                                                                                 // 49
                                                                                                                  // 50
SyncedCron.add({                                                                                                  // 51
  name: 'Schedule newsletter',                                                                                    // 52
  schedule: function(parser) {                                                                                    // 53
    // parser is a later.parse object                                                                             // 54
    // var sched;                                                                                                 // 55
    return getSchedule(parser)                                                                                    // 56
                                                                                                                  // 57
  },                                                                                                              // 58
  job: function() {                                                                                               // 59
    scheduleNextCampaign();                                                                                       // 60
  }                                                                                                               // 61
});                                                                                                               // 62
                                                                                                                  // 63
Meteor.startup(function() {                                                                                       // 64
  if(getSetting('newsletterFrequency', defaultFrequency) != 0) {                                                  // 65
    SyncedCron.start();                                                                                           // 66
  };                                                                                                              // 67
});                                                                                                               // 68
                                                                                                                  // 69
Meteor.methods({                                                                                                  // 70
  getNextJob: function (jobName) {                                                                                // 71
    var nextJob = getNextCampaignSchedule();                                                                      // 72
    console.log(nextJob);                                                                                         // 73
    return nextJob;                                                                                               // 74
  }                                                                                                               // 75
});                                                                                                               // 76
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-newsletter/lib/server/mailchimp.js                                                          //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
scheduleCampaign = function (campaign, isTest) {                                                                  // 1
  var isTest = typeof isTest === 'undefined' ? false : isTest;                                                    // 2
                                                                                                                  // 3
  MailChimpOptions.apiKey = getSetting('mailChimpAPIKey');                                                        // 4
  MailChimpOptions.listId = getSetting('mailChimpListId');                                                        // 5
                                                                                                                  // 6
  var htmlToText = Npm.require('html-to-text');                                                                   // 7
  var text = htmlToText.fromString(campaign.html, {                                                               // 8
      wordwrap: 130                                                                                               // 9
  });                                                                                                             // 10
  var defaultEmail = getSetting('defaultEmail');                                                                  // 11
  var result= '';                                                                                                 // 12
                                                                                                                  // 13
  if(!!MailChimpOptions.apiKey && !!MailChimpOptions.listId){                                                     // 14
                                                                                                                  // 15
    console.log( 'Creating campaign…');                                                                           // 16
                                                                                                                  // 17
    try {                                                                                                         // 18
        var api = new MailChimp();                                                                                // 19
    } catch ( error ) {                                                                                           // 20
        console.log( error.message );                                                                             // 21
    }                                                                                                             // 22
                                                                                                                  // 23
    api.call( 'campaigns', 'create', {                                                                            // 24
      type: 'regular',                                                                                            // 25
      options: {                                                                                                  // 26
        list_id: MailChimpOptions.listId,                                                                         // 27
        subject: campaign.subject,                                                                                // 28
        from_email: getSetting('defaultEmail'),                                                                   // 29
        from_name: getSetting('title')+ ' Top Posts',                                                             // 30
      },                                                                                                          // 31
      content: {                                                                                                  // 32
        html: campaign.html,                                                                                      // 33
        text: text                                                                                                // 34
      }                                                                                                           // 35
    }, Meteor.bindEnvironment(function ( error, result ) {                                                        // 36
      if ( error ) {                                                                                              // 37
        console.log( error.message );                                                                             // 38
        result = error.message;                                                                                   // 39
      } else {                                                                                                    // 40
        console.log( 'Campaign created');                                                                         // 41
        // console.log( JSON.stringify( result ) );                                                               // 42
                                                                                                                  // 43
        var cid = result.id;                                                                                      // 44
        var archive_url = result.archive_url;                                                                     // 45
        var scheduledTime = moment().zone(0).add('hours', 1).format("YYYY-MM-DD HH:mm:ss");                       // 46
                                                                                                                  // 47
        api.call('campaigns', 'schedule', {                                                                       // 48
          cid: cid,                                                                                               // 49
          schedule_time: scheduledTime                                                                            // 50
        }, Meteor.bindEnvironment(function ( error, result) {                                                     // 51
          if (error) {                                                                                            // 52
            console.log( error.message );                                                                         // 53
            result = error.message;                                                                               // 54
          }else{                                                                                                  // 55
            console.log('Campaign scheduled for '+scheduledTime);                                                 // 56
            console.log(campaign.subject)                                                                         // 57
            // console.log( JSON.stringify( result ) );                                                           // 58
                                                                                                                  // 59
            // if this is not a test, mark posts as sent                                                          // 60
            if (!isTest)                                                                                          // 61
              Posts.update({_id: {$in: campaign.postIds}}, {$set: {scheduledAt: new Date()}}, {multi: true})      // 62
                                                                                                                  // 63
            // send confirmation email                                                                            // 64
            var confirmationHtml = getEmailTemplate('emailDigestConfirmation')({                                  // 65
              time: scheduledTime,                                                                                // 66
              newsletterLink: archive_url,                                                                        // 67
              subject: campaign.subject                                                                           // 68
            });                                                                                                   // 69
            sendEmail(defaultEmail, 'Newsletter scheduled', buildEmailTemplate(confirmationHtml));                // 70
            result = campaign.subject;                                                                            // 71
          }                                                                                                       // 72
        }));                                                                                                      // 73
      }                                                                                                           // 74
    }));                                                                                                          // 75
  }                                                                                                               // 76
  return result;                                                                                                  // 77
}                                                                                                                 // 78
                                                                                                                  // 79
addToMailChimpList = function(userOrEmail, confirm, done){                                                        // 80
  var user, email;                                                                                                // 81
                                                                                                                  // 82
  if(typeof userOrEmail == "string"){                                                                             // 83
    user = null;                                                                                                  // 84
    email = userOrEmail;                                                                                          // 85
  }else if(typeof userOrEmail == "object"){                                                                       // 86
    user = userOrEmail;                                                                                           // 87
    email = getEmail(user);                                                                                       // 88
    if (!email)                                                                                                   // 89
      throw 'User must have an email address';                                                                    // 90
  }                                                                                                               // 91
                                                                                                                  // 92
  MailChimpOptions.apiKey = getSetting('mailChimpAPIKey');                                                        // 93
  MailChimpOptions.listId = getSetting('mailChimpListId');                                                        // 94
  // add a user to a MailChimp list.                                                                              // 95
  // called when a new user is created, or when an existing user fills in their email                             // 96
  if(!!MailChimpOptions.apiKey && !!MailChimpOptions.listId){                                                     // 97
                                                                                                                  // 98
    console.log('adding "'+email+'" to MailChimp list…');                                                         // 99
                                                                                                                  // 100
    try {                                                                                                         // 101
        var api = new MailChimp();                                                                                // 102
    } catch ( error ) {                                                                                           // 103
        console.log( error.message );                                                                             // 104
    }                                                                                                             // 105
                                                                                                                  // 106
    api.call( 'lists', 'subscribe', {                                                                             // 107
      id: MailChimpOptions.listId,                                                                                // 108
      email: {"email": email},                                                                                    // 109
      double_optin: confirm                                                                                       // 110
    }, Meteor.bindEnvironment(function ( error, result ) {                                                        // 111
      if ( error ) {                                                                                              // 112
        console.log( error.message );                                                                             // 113
        done(error, null);                                                                                        // 114
      } else {                                                                                                    // 115
        console.log( JSON.stringify( result ) );                                                                  // 116
        if(!!user)                                                                                                // 117
          setUserSetting('subscribedToNewsletter', true, user);                                                   // 118
        done(null, result);                                                                                       // 119
      }                                                                                                           // 120
    }));                                                                                                          // 121
  }                                                                                                               // 122
                                                                                                                  // 123
};                                                                                                                // 124
                                                                                                                  // 125
syncAddToMailChimpList = Async.wrap(addToMailChimpList);                                                          // 126
                                                                                                                  // 127
Meteor.methods({                                                                                                  // 128
  addCurrentUserToMailChimpList: function(){                                                                      // 129
    var currentUser = Meteor.users.findOne(this.userId);                                                          // 130
    try {                                                                                                         // 131
      return syncAddToMailChimpList(currentUser, false);                                                          // 132
    } catch (error) {                                                                                             // 133
      throw new Meteor.Error(500, error.message);                                                                 // 134
    }                                                                                                             // 135
  },                                                                                                              // 136
  addEmailToMailChimpList: function (email) {                                                                     // 137
    try {                                                                                                         // 138
      return syncAddToMailChimpList(email, true);                                                                 // 139
    } catch (error) {                                                                                             // 140
      throw new Meteor.Error(500, error.message);                                                                 // 141
    }                                                                                                             // 142
  }                                                                                                               // 143
})                                                                                                                // 144
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-newsletter/lib/server/routes.js                                                             //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
Meteor.startup(function () {                                                                                      // 1
                                                                                                                  // 2
  Router.route('/email/campaign', {                                                                               // 3
    name: 'campaign',                                                                                             // 4
    where: 'server',                                                                                              // 5
    action: function() {                                                                                          // 6
      var campaign = buildCampaign(getCampaignPosts(getSetting('postsPerNewsletter', 5)));                        // 7
      var campaignSubject = '<div class="campaign-subject"><strong>Subject:</strong> '+campaign.subject+' (note: contents might change)</div>';
      var campaignSchedule = '<div class="campaign-schedule"><strong>Scheduled for:</strong> '+getNextCampaignSchedule()+'</div>';
                                                                                                                  // 10
      this.response.write(campaignSubject+campaignSchedule+campaign.html);                                        // 11
      this.response.end();                                                                                        // 12
    }                                                                                                             // 13
  });                                                                                                             // 14
                                                                                                                  // 15
  Router.route('/email/digest-confirmation', {                                                                    // 16
    name: 'digestConfirmation',                                                                                   // 17
    where: 'server',                                                                                              // 18
    action: function() {                                                                                          // 19
      var confirmationHtml = getEmailTemplate('emailDigestConfirmation')({                                        // 20
        time: 'January 1st, 1901',                                                                                // 21
        newsletterLink: 'http://example.com',                                                                     // 22
        subject: 'Lorem ipsum dolor sit amet'                                                                     // 23
      });                                                                                                         // 24
      this.response.write(buildEmailTemplate(confirmationHtml));                                                  // 25
      this.response.end();                                                                                        // 26
    }                                                                                                             // 27
  });                                                                                                             // 28
                                                                                                                  // 29
});                                                                                                               // 30
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-newsletter/lib/server/templates/handlebars.emailDigest.js                                   //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
Handlebars = Handlebars || {};Handlebars.templates = Handlebars.templates || {} ;var template = OriginalHandlebars.compile("<style type=\"text/css\">\n  .email-digest{\n  }\n  .digest-date{\n    color: #999;\n    font-weight: normal;\n    font-size: 16px;\n  }\n  .post-item{\n    border-top: 1px solid #ddd;\n  }\n  .post-date{\n    font-size: 13px;\n    color: #999;\n  }\n  .post-title{\n    font-size: 18px;\n    line-height: 1.6;\n  }\n  .post-thumbnail{\n  }\n  .post-meta{\n    font-size: 13px;\n    color: #999;\n    margin: 5px 0;\n  }\n  .post-meta a{\n    color: #333;\n  }  \n  .post-domain{\n    font-weight: bold;\n  }\n  .post-body-excerpt{\n    font-size: 14px;\n  }\n  .post-body-excerpt p{\n    margin: 0;\n  }\n</style>\n\n<span class=\"heading\">Recently on {{siteName}}</span>\n<span class=\"digest-date\">– {{date}}</span>\n<br><br>\n\n<div class=\"email-digest\">\n  {{{content}}}\n</div>\n<br>");Handlebars.templates["emailDigest"] = function (data, partials) { partials = (partials || {});return template(data || {}, { helpers: OriginalHandlebars.helpers,partials: partials,name: "emailDigest"});};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-newsletter/lib/server/templates/handlebars.emailDigestConfirmation.js                       //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
Handlebars = Handlebars || {};Handlebars.templates = Handlebars.templates || {} ;var template = OriginalHandlebars.compile("<span class=\"heading\">Newsletter scheduled for {{time}}</span><br><br>\n\n<a href=\"{{newsletterLink}}\">{{subject}}</a><br><br>");Handlebars.templates["emailDigestConfirmation"] = function (data, partials) { partials = (partials || {});return template(data || {}, { helpers: OriginalHandlebars.helpers,partials: partials,name: "emailDigestConfirmation"});};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-newsletter/lib/server/templates/handlebars.emailPostItem.js                                 //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
Handlebars = Handlebars || {};Handlebars.templates = Handlebars.templates || {} ;var template = OriginalHandlebars.compile("<div class=\"post-item\">\n<br >\n\n<span class=\"post-title\">\n  {{#if thumbnailUrl}}\n    <img class=\"post-thumbnail\" src=\"{{thumbnailUrl}}\"/>&nbsp;\n  {{/if}}\n\n  <a href=\"{{postLink}}\" target=\"_blank\">{{title}}</a>\n</span>\n\n<div class=\"post-meta\">\n  {{#if domain}}\n    <a class=\"post-domain\" href=\"\">{{domain}}</a>\n    | \n  {{/if}}\n  <span class=\"post-submitted\">Submitted by <a href=\"{{profileUrl}}\" class=\"comment-link\" target=\"_blank\">{{authorName}}</a></span>\n  <span class=\"post-date\">on {{date}}</span>\n  |\n  <a href=\"{{postPageLink}}\" class=\"comment-link\" target=\"_blank\">{{comments}} Comments</a>\n</div>\n\n\n{{#if body}}\n  <div class=\"post-body-excerpt\">\n    {{{htmlBody}}}\n    <a href=\"{{postPageLink}}\" class=\"comment-link\" target=\"_blank\">Read more</a>\n  </div>\n{{/if}}\n\n\n<br>\n</div>\n\n");Handlebars.templates["emailPostItem"] = function (data, partials) { partials = (partials || {});return template(data || {}, { helpers: OriginalHandlebars.helpers,partials: partials,name: "emailPostItem"});};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-newsletter/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-newsletter/i18n/de.i18n. //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _ = Package.underscore._,                                                                                     // 1
    package_name = "telescope-newsletter",                                                                        // 2
    namespace = "telescope-newsletter";                                                                           // 3
                                                                                                                  // 4
if (package_name != "project") {                                                                                  // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                         // 6
}                                                                                                                 // 7
if(_.isUndefined(TAPi18n.translations["de"])) {                                                                   // 8
  TAPi18n.translations["de"] = {};                                                                                // 9
}                                                                                                                 // 10
                                                                                                                  // 11
if(_.isUndefined(TAPi18n.translations["de"][namespace])) {                                                        // 12
  TAPi18n.translations["de"][namespace] = {};                                                                     // 13
}                                                                                                                 // 14
                                                                                                                  // 15
_.extend(TAPi18n.translations["de"][namespace], {"receive_the_best_of":"Receive the best of","right_in_your_inbox":"right in your inbox.","get_newsletter":"Get Newsletter","thanks_for_subscribing":"Thanks for subscribing!"});
                                                                                                                  // 17
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-newsletter/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-newsletter/i18n/en.i18n. //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _ = Package.underscore._,                                                                                     // 1
    package_name = "telescope-newsletter",                                                                        // 2
    namespace = "telescope-newsletter";                                                                           // 3
                                                                                                                  // 4
if (package_name != "project") {                                                                                  // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                         // 6
}                                                                                                                 // 7
// integrate the fallback language translations                                                                   // 8
TAPi18n.addResourceBundle("en", namespace, {"receive_the_best_of":"Receive the best of","right_in_your_inbox":"right in your inbox.","get_newsletter":"Get Newsletter","thanks_for_subscribing":"Thanks for subscribing!"});
                                                                                                                  // 10
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-newsletter/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-newsletter/i18n/es.i18n. //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _ = Package.underscore._,                                                                                     // 1
    package_name = "telescope-newsletter",                                                                        // 2
    namespace = "telescope-newsletter";                                                                           // 3
                                                                                                                  // 4
if (package_name != "project") {                                                                                  // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                         // 6
}                                                                                                                 // 7
if(_.isUndefined(TAPi18n.translations["es"])) {                                                                   // 8
  TAPi18n.translations["es"] = {};                                                                                // 9
}                                                                                                                 // 10
                                                                                                                  // 11
if(_.isUndefined(TAPi18n.translations["es"][namespace])) {                                                        // 12
  TAPi18n.translations["es"][namespace] = {};                                                                     // 13
}                                                                                                                 // 14
                                                                                                                  // 15
_.extend(TAPi18n.translations["es"][namespace], {"receive_the_best_of":"Receive the best of","right_in_your_inbox":"right in your inbox.","get_newsletter":"Get Newsletter","thanks_for_subscribing":"Thanks for subscribing!"});
                                                                                                                  // 17
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-newsletter/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-newsletter/i18n/fr.i18n. //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _ = Package.underscore._,                                                                                     // 1
    package_name = "telescope-newsletter",                                                                        // 2
    namespace = "telescope-newsletter";                                                                           // 3
                                                                                                                  // 4
if (package_name != "project") {                                                                                  // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                         // 6
}                                                                                                                 // 7
if(_.isUndefined(TAPi18n.translations["fr"])) {                                                                   // 8
  TAPi18n.translations["fr"] = {};                                                                                // 9
}                                                                                                                 // 10
                                                                                                                  // 11
if(_.isUndefined(TAPi18n.translations["fr"][namespace])) {                                                        // 12
  TAPi18n.translations["fr"][namespace] = {};                                                                     // 13
}                                                                                                                 // 14
                                                                                                                  // 15
_.extend(TAPi18n.translations["fr"][namespace], {"receive_the_best_of":"Receive the best of","right_in_your_inbox":"right in your inbox.","get_newsletter":"Get Newsletter","thanks_for_subscribing":"Thanks for subscribing!"});
                                                                                                                  // 17
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-newsletter/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-newsletter/i18n/it.i18n. //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _ = Package.underscore._,                                                                                     // 1
    package_name = "telescope-newsletter",                                                                        // 2
    namespace = "telescope-newsletter";                                                                           // 3
                                                                                                                  // 4
if (package_name != "project") {                                                                                  // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                         // 6
}                                                                                                                 // 7
if(_.isUndefined(TAPi18n.translations["it"])) {                                                                   // 8
  TAPi18n.translations["it"] = {};                                                                                // 9
}                                                                                                                 // 10
                                                                                                                  // 11
if(_.isUndefined(TAPi18n.translations["it"][namespace])) {                                                        // 12
  TAPi18n.translations["it"][namespace] = {};                                                                     // 13
}                                                                                                                 // 14
                                                                                                                  // 15
_.extend(TAPi18n.translations["it"][namespace], {"receive_the_best_of":"Receive the best of","right_in_your_inbox":"right in your inbox.","get_newsletter":"Get Newsletter","thanks_for_subscribing":"Thanks for subscribing!"});
                                                                                                                  // 17
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/telescope-newsletter/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-newsletter/i18n/zh-CN.i1 //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var _ = Package.underscore._,                                                                                     // 1
    package_name = "telescope-newsletter",                                                                        // 2
    namespace = "telescope-newsletter";                                                                           // 3
                                                                                                                  // 4
if (package_name != "project") {                                                                                  // 5
    namespace = TAPi18n.packages[package_name].namespace;                                                         // 6
}                                                                                                                 // 7
if(_.isUndefined(TAPi18n.translations["zh-CN"])) {                                                                // 8
  TAPi18n.translations["zh-CN"] = {};                                                                             // 9
}                                                                                                                 // 10
                                                                                                                  // 11
if(_.isUndefined(TAPi18n.translations["zh-CN"][namespace])) {                                                     // 12
  TAPi18n.translations["zh-CN"][namespace] = {};                                                                  // 13
}                                                                                                                 // 14
                                                                                                                  // 15
_.extend(TAPi18n.translations["zh-CN"][namespace], {"receive_the_best_of":"Receive the best of","right_in_your_inbox":"right in your inbox.","get_newsletter":"Get Newsletter","thanks_for_subscribing":"Thanks for subscribing!"});
                                                                                                                  // 17
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-newsletter'] = {};

})();

//# sourceMappingURL=telescope-newsletter.js.map
