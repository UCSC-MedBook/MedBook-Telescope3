Meteor.startup(function () {

  Template[getTemplate('AddCollaboration')].helpers({
    potential : function() {
        return ["Aa", "Bb", "Cc"];
        }
    });
  Template[getTemplate('AddCollaboration')].events({
    'click .edit-link': function (e, tmpl) {
      e.preventDefault();

      var pack = {
        name: (tmpl.find(".collaboration-name").value),
        description: (tmpl.find(".collaboration-description").value),
        collaborators: (tmpl.find(".collaboration-collaborators").value),
        administrators: (tmpl.find(".collaboration-administrators").value),
        invitations: (tmpl.find(".collaboration-invitations").value),
        applications: []
      };

      createCollaboration(pack);
      tmpl.find("form").reset();
    }
  });

  Template[getTemplate('AddCollaboration')].rendered = function() {
      var data = [{ id: 1, text: "Aa" }, { id: 2, text: "Bb" }, { id: 3, text: "Cc" }];
      $("#collaborators").select2({ width: "100%", multiple: true, data: data });
  }

});
