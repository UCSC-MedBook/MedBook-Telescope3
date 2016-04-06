

// push "fileId" property to addToPostSchema, so that it's later added to postSchema

Meteor.autorun(function() {
    addToPostSchema.push(
      {
        propertyName: 'medbookfiles',
        propertySchema: {
          type: [String],
          optional: true,
    /*
          editable: true,
          autoform: {
            type: "cfs-files",
            collection: "files"
          }
    */
        }
      }
    );

});
