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
var TAPi18next = Package['tap:i18n'].TAPi18next;
var TAPi18n = Package['tap:i18n'].TAPi18n;

/* Package-scope variables */
var preloadSubscriptions, adminNav, Categories, addToPostSchema, primaryNav, postModules, categorySchema, getCategoryUrl, __;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                 //
// packages/telescope-tags/lib/tags.js                                                             //
//                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                   //
categorySchema = new SimpleSchema({                                                                // 1
 _id: {                                                                                            // 2
    type: String,                                                                                  // 3
    optional: true                                                                                 // 4
  },                                                                                               // 5
  order: {                                                                                         // 6
    type: Number,                                                                                  // 7
    optional: true                                                                                 // 8
  },                                                                                               // 9
  slug: {                                                                                          // 10
    type: String                                                                                   // 11
  },                                                                                               // 12
  name: {                                                                                          // 13
    type: String                                                                                   // 14
  },                                                                                               // 15
});                                                                                                // 16
                                                                                                   // 17
Categories = new Meteor.Collection("categories", {                                                 // 18
  schema: categorySchema                                                                           // 19
});                                                                                                // 20
                                                                                                   // 21
// category post list parameters                                                                   // 22
viewParameters.category = function (terms) {                                                       // 23
  return {                                                                                         // 24
    find: {'categories.slug': terms.category},                                                     // 25
    options: {sort: {sticky: -1, score: -1}}                                                       // 26
  };                                                                                               // 27
}                                                                                                  // 28
                                                                                                   // 29
// push "categories" modules to postHeading                                                        // 30
postHeading.push({                                                                                 // 31
  template: 'postCategories',                                                                      // 32
  order: 3                                                                                         // 33
});                                                                                                // 34
                                                                                                   // 35
// push "categoriesMenu" template to primaryNav                                                    // 36
primaryNav.push('categoriesMenu');                                                                 // 37
                                                                                                   // 38
// push "categories" property to addToPostSchema, so that it's later added to postSchema           // 39
addToPostSchema.push(                                                                              // 40
  {                                                                                                // 41
    propertyName: 'categories',                                                                    // 42
    propertySchema: {                                                                              // 43
      type: [categorySchema],                                                                      // 44
      optional: true                                                                               // 45
    }                                                                                              // 46
  }                                                                                                // 47
);                                                                                                 // 48
                                                                                                   // 49
var getCheckedCategories = function (properties) {                                                 // 50
  properties.categories = [];                                                                      // 51
  $('input[name=category]:checked').each(function() {                                              // 52
    var categoryId = $(this).val();                                                                // 53
    properties.categories.push(Categories.findOne(categoryId));                                    // 54
  });                                                                                              // 55
  return properties;                                                                               // 56
}                                                                                                  // 57
                                                                                                   // 58
postSubmitClientCallbacks.push(getCheckedCategories);                                              // 59
postEditClientCallbacks.push(getCheckedCategories);                                                // 60
                                                                                                   // 61
Meteor.startup(function () {                                                                       // 62
  Categories.allow({                                                                               // 63
    insert: isAdminById                                                                            // 64
  , update: isAdminById                                                                            // 65
  , remove: isAdminById                                                                            // 66
  });                                                                                              // 67
                                                                                                   // 68
  Meteor.methods({                                                                                 // 69
    category: function(category){                                                                  // 70
      console.log(category)                                                                        // 71
      if (!Meteor.user() || !isAdmin(Meteor.user()))                                               // 72
        throw new Meteor.Error(i18n.t('you_need_to_login_and_be_an_admin_to_add_a_new_category')); // 73
      var categoryId=Categories.insert(category);                                                  // 74
      return category.name;                                                                        // 75
    }                                                                                              // 76
  });                                                                                              // 77
});                                                                                                // 78
                                                                                                   // 79
getCategoryUrl = function(slug){                                                                   // 80
  return getSiteUrl()+'category/'+slug;                                                            // 81
};                                                                                                 // 82
/////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                 //
// packages/telescope-tags/package-i18n.js                                                         //
//                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                   //
TAPi18n.packages["telescope-tags"] = {"translation_function_name":"__","helper_name":"_","namespace":"telescope-tags"};
                                                                                                   // 2
// define package's translation function (proxy to the i18next)                                    // 3
__ = TAPi18n._getPackageI18nextProxy("telescope-tags");                                            // 4
                                                                                                   // 5
/////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                 //
// packages/telescope-tags/lib/server/publications.js                                              //
//                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                   //
Meteor.publish('categories', function() {                                                          // 1
  if(canViewById(this.userId)){                                                                    // 2
    return Categories.find();                                                                      // 3
  }                                                                                                // 4
  return [];                                                                                       // 5
});                                                                                                // 6
/////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                 //
// packages/telescope-tags/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-tags/i18n/de.i1 //
//                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                   //
var _ = Package.underscore._,                                                                      // 1
    package_name = "telescope-tags",                                                               // 2
    namespace = "telescope-tags";                                                                  // 3
                                                                                                   // 4
if (package_name != "project") {                                                                   // 5
    namespace = TAPi18n.packages[package_name].namespace;                                          // 6
}                                                                                                  // 7
if(_.isUndefined(TAPi18n.translations["de"])) {                                                    // 8
  TAPi18n.translations["de"] = {};                                                                 // 9
}                                                                                                  // 10
                                                                                                   // 11
if(_.isUndefined(TAPi18n.translations["de"][namespace])) {                                         // 12
  TAPi18n.translations["de"][namespace] = {};                                                      // 13
}                                                                                                  // 14
                                                                                                   // 15
_.extend(TAPi18n.translations["de"][namespace], {"categories":"Kategorien"});                      // 16
                                                                                                   // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                 //
// packages/telescope-tags/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-tags/i18n/en.i1 //
//                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                   //
var _ = Package.underscore._,                                                                      // 1
    package_name = "telescope-tags",                                                               // 2
    namespace = "telescope-tags";                                                                  // 3
                                                                                                   // 4
if (package_name != "project") {                                                                   // 5
    namespace = TAPi18n.packages[package_name].namespace;                                          // 6
}                                                                                                  // 7
// integrate the fallback language translations                                                    // 8
TAPi18n.addResourceBundle("en", namespace, {"categories":"Categories"});                           // 9
                                                                                                   // 10
/////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                 //
// packages/telescope-tags/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-tags/i18n/es.i1 //
//                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                   //
var _ = Package.underscore._,                                                                      // 1
    package_name = "telescope-tags",                                                               // 2
    namespace = "telescope-tags";                                                                  // 3
                                                                                                   // 4
if (package_name != "project") {                                                                   // 5
    namespace = TAPi18n.packages[package_name].namespace;                                          // 6
}                                                                                                  // 7
if(_.isUndefined(TAPi18n.translations["es"])) {                                                    // 8
  TAPi18n.translations["es"] = {};                                                                 // 9
}                                                                                                  // 10
                                                                                                   // 11
if(_.isUndefined(TAPi18n.translations["es"][namespace])) {                                         // 12
  TAPi18n.translations["es"][namespace] = {};                                                      // 13
}                                                                                                  // 14
                                                                                                   // 15
_.extend(TAPi18n.translations["es"][namespace], {"categories":"Categorías"});                      // 16
                                                                                                   // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                 //
// packages/telescope-tags/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-tags/i18n/fr.i1 //
//                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                   //
var _ = Package.underscore._,                                                                      // 1
    package_name = "telescope-tags",                                                               // 2
    namespace = "telescope-tags";                                                                  // 3
                                                                                                   // 4
if (package_name != "project") {                                                                   // 5
    namespace = TAPi18n.packages[package_name].namespace;                                          // 6
}                                                                                                  // 7
if(_.isUndefined(TAPi18n.translations["fr"])) {                                                    // 8
  TAPi18n.translations["fr"] = {};                                                                 // 9
}                                                                                                  // 10
                                                                                                   // 11
if(_.isUndefined(TAPi18n.translations["fr"][namespace])) {                                         // 12
  TAPi18n.translations["fr"][namespace] = {};                                                      // 13
}                                                                                                  // 14
                                                                                                   // 15
_.extend(TAPi18n.translations["fr"][namespace], {"categories":"Catégories"});                      // 16
                                                                                                   // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                 //
// packages/telescope-tags/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-tags/i18n/it.i1 //
//                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                   //
var _ = Package.underscore._,                                                                      // 1
    package_name = "telescope-tags",                                                               // 2
    namespace = "telescope-tags";                                                                  // 3
                                                                                                   // 4
if (package_name != "project") {                                                                   // 5
    namespace = TAPi18n.packages[package_name].namespace;                                          // 6
}                                                                                                  // 7
if(_.isUndefined(TAPi18n.translations["it"])) {                                                    // 8
  TAPi18n.translations["it"] = {};                                                                 // 9
}                                                                                                  // 10
                                                                                                   // 11
if(_.isUndefined(TAPi18n.translations["it"][namespace])) {                                         // 12
  TAPi18n.translations["it"][namespace] = {};                                                      // 13
}                                                                                                  // 14
                                                                                                   // 15
_.extend(TAPi18n.translations["it"][namespace], {"categories":"Categorie"});                       // 16
                                                                                                   // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                 //
// packages/telescope-tags/Users/ted/MedBook/MedBook-Telescope3/packages/telescope-tags/i18n/zh-CN //
//                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                   //
var _ = Package.underscore._,                                                                      // 1
    package_name = "telescope-tags",                                                               // 2
    namespace = "telescope-tags";                                                                  // 3
                                                                                                   // 4
if (package_name != "project") {                                                                   // 5
    namespace = TAPi18n.packages[package_name].namespace;                                          // 6
}                                                                                                  // 7
if(_.isUndefined(TAPi18n.translations["zh-CN"])) {                                                 // 8
  TAPi18n.translations["zh-CN"] = {};                                                              // 9
}                                                                                                  // 10
                                                                                                   // 11
if(_.isUndefined(TAPi18n.translations["zh-CN"][namespace])) {                                      // 12
  TAPi18n.translations["zh-CN"][namespace] = {};                                                   // 13
}                                                                                                  // 14
                                                                                                   // 15
_.extend(TAPi18n.translations["zh-CN"][namespace], {"categories":"分类"});                           // 16
                                                                                                   // 17
/////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['telescope-tags'] = {
  preloadSubscriptions: preloadSubscriptions,
  adminNav: adminNav,
  Categories: Categories,
  addToPostSchema: addToPostSchema,
  primaryNav: primaryNav,
  postModules: postModules
};

})();

//# sourceMappingURL=telescope-tags.js.map
