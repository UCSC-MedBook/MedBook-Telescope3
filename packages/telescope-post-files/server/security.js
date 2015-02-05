function trueFunc() {return true;}
function falseFunc() {return false;}

Meteor.startup(function() {

    Collections.Blobs.allow({
      insert: trueFunc,
      update: trueFunc,
      remove: trueFunc,
      download: trueFunc
    });

    Collections.Blobs.deny({
      insert: falseFunc,
      update: falseFunc,
      remove: falseFunc,
      download: falseFunc
    });

});
