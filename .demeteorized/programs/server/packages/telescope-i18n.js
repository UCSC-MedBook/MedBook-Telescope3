(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var TAPi18next = Package['tap:i18n'].TAPi18next;
var TAPi18n = Package['tap:i18n'].TAPi18n;

/* Package-scope variables */
var i18n, setLanguage;

(function () {

///////////////////////////////////////////////////////////////////////////////
//                                                                           //
// packages/telescope-i18n/i18n.js                                           //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////
                                                                             //
// do this better:                                                           // 1
setLanguage = function (language) {                                          // 2
  // Session.set('i18nReady', false);                                        // 3
  // console.log('i18n loading… '+language)                                  // 4
                                                                             // 5
  // moment                                                                  // 6
  Session.set('momentReady', false);                                         // 7
  // console.log('moment loading…')                                          // 8
  $.getScript("//cdnjs.cloudflare.com/ajax/libs/moment.js/2.5.1/lang/" + language.toLowerCase() + ".js", function (result) {
    moment.locale(language);                                                 // 10
    Session.set('momentReady', true);                                        // 11
    Session.set('momentLocale', language);                                   // 12
    // console.log('moment loaded!')                                         // 13
  });                                                                        // 14
                                                                             // 15
  // TAPi18n                                                                 // 16
  Session.set("TAPi18nReady", false);                                        // 17
  // console.log('TAPi18n loading…')                                         // 18
  TAPi18n.setLanguage(language)                                              // 19
    .done(function () {                                                      // 20
      Session.set("TAPi18nReady", true);                                     // 21
      // console.log('TAPi18n loaded!')                                      // 22
    });                                                                      // 23
                                                                             // 24
  // T9n                                                                     // 25
  T9n.setLanguage(language);                                                 // 26
}                                                                            // 27
                                                                             // 28
i18n = {                                                                     // 29
  t: function (str, options) {                                               // 30
    if (Meteor.isServer) {                                                   // 31
      return TAPi18n.__(str, options, getSetting('language', 'en'));         // 32
    } else {                                                                 // 33
      return TAPi18n.__(str, options);                                       // 34
    }                                                                        // 35
  }                                                                          // 36
};                                                                           // 37
                                                                             // 38
Meteor.startup(function () {                                                 // 39
                                                                             // 40
  if (Meteor.isClient) {                                                     // 41
                                                                             // 42
    // doesn't quite work yet                                                // 43
    // Tracker.autorun(function (c) {                                        // 44
    //   console.log('momentReady',Session.get('momentReady'))               // 45
    //   console.log('i18nReady',Session.get('i18nReady'))                   // 46
    //   var ready = Session.get('momentReady') && Session.get('i18nReady'); // 47
    //   if (ready) {                                                        // 48
    //     Session.set('i18nReady', true);                                   // 49
    //     Session.set('locale', language);                                  // 50
    //     console.log('i18n ready! '+language)                              // 51
    //   }                                                                   // 52
    // });                                                                   // 53
                                                                             // 54
    setLanguage(getSetting('language', 'en'));                               // 55
  }                                                                          // 56
                                                                             // 57
});                                                                          // 58
                                                                             // 59
///////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-i18n'] = {
  i18n: i18n,
  setLanguage: setLanguage
};

})();

//# sourceMappingURL=telescope-i18n.js.map
