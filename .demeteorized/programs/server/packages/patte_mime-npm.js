(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var MIME;

(function () {

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/patte:mime-npm/lib/mime.js                               //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
MIME = Npm.require("mime")                                           // 1
                                                                     // 2
///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['patte:mime-npm'] = {
  MIME: MIME
};

})();

//# sourceMappingURL=patte_mime-npm.js.map
