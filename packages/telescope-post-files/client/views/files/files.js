// Can't call getHandler until startup so that Collections object is available
Meteor.startup(function () {

  Template.files.events({
    'change input.any': FS.EventHandlers.insertFiles(Collections.Files, {
      metadata: function (fileObj) {
        return {
          owner: Meteor.userId(),
          foo: "bar",
          dropped: false
        };
      },
      after: function (error, fileObj) {
        if (!error) {
          console.log("Inserted", fileObj.name());
        }
      }
    })
  });

  Template.uploadedFile.helpers( {
      getid : function() {
         return this._id;
      },
  });

  Template.files.uploadedFiles = function() {
     return Collections.Files.find( {post: { $exists: false }, owner: Meteor.userId()} );
  };

  Template.postedFiles.helpers({
    medbookfiles : function() {
        return Collections.Files.find({post: this._id});
    }
  });

});

