Collections = {};

Meteor.isClient && Template.registerHelper("Collections", Collections);

Collections.Files = new FS.Collection("files", {
  stores: [Stores.any],
  chunkSize: 4 * 1024 * 1024
});
