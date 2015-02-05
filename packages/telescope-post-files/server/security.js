function trueFunc() {return true;}
function falseFunc() {return false;}

Meteor.startup(function() {

    Collections.Files.allow({
      insert: trueFunc,
      update: trueFunc,
      remove: trueFunc,
      download: trueFunc
    });

    Collections.Files.deny({
      insert: falseFunc,
      update: falseFunc,
      remove: falseFunc,
      download: falseFunc
    });

});
