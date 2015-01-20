
window.hideEditOrAddCollaboration = function() {
    $(".collapsed").hide()
}

Meteor.startup(function () {

  Template[getTemplate('EditOrAddCollaboration')].helpers({
    potential : function() {
        return ["Aa", "Bb", "Cc"];
        }
    });
  Template[getTemplate('EditOrAddCollaboration')].events({
    'click .cancel': function (e, tmpl) {
        window.hideEditOrAddCollaboration();
    },

    'click .edit-link': function (e, tmpl) {
      e.preventDefault();

      var pack = {
        name: (tmpl.find(".collaboration-name").value),
        description: (tmpl.find(".collaboration-description").value),
        collaborators: (tmpl.find("#collaborators").value),
        administrators: (tmpl.find(".collaboration-administrators").value),
        invitations: (tmpl.find(".collaboration-invitations").value),
        applications: []
      };

      createCollaboration(pack, function() { tmpl.find("form").reset(); });
    }
  });
  function getCollabTags() {
      var data = [];
      Meteor.users._collection.find().forEach(
          function(user){
              console.log(user);
              var id = user.emails[0].address;
              user.emails.map(function(em) { 
                  data.push({id:id, text: em.address});
              });

              if (user.username)
                  data.push({id:id, text: user.username});
      })
      Collaboration.find().forEach(function(col) { data.push({id: col._id, text: col.name}); });
      data.sort(function (a, b) {
            if (a.text > b.text) { return 1; }
            if (a.text < b.text) { return -1; }
            return 0;
      });
      return data;
  }
  window.getCollabTags = getCollabTags;


  Template[getTemplate('EditOrAddCollaboration')].rendered = function() {
      var data = getCollabTags();
      $(document).ready( function() {
          $("#collaborators").select2({ tags: data, width: "100%", multiple: true});
          $("#adminstrators").select2({ tags: data, width: "100%", multiple: true});
      });
  }
  Template[getTemplate('EditOrAddCollaboration')].helpers({
     administrators : function() { return "A" },
     collaborators : function() { return "C" },
  });
});
