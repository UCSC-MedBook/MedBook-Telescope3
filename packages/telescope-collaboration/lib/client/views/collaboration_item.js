
window.hideEditOrAddCollaboration = function() {
    $(".collapsed").hide()
}

function goCollaborationlist() { 
    hideEditOrAddCollaboration();
    Router.go("collaborationList"); 
}

AutoForm.hooks({
  editCollaboration: { onSuccess: goCollaborationlist },
  addCollaboration: { onSuccess: goCollaborationlist },
});



function Sel()  {
    var names = [];
    Collaboration.find({}, {fields: {name:1}}).forEach(function(c) { names.push(c.name)});
    var moi = null;
    var defaultCollaboration = null;
    var u = Meteor.user();
    var em = getEmails();
    if (em)
        moi = em[0];
    if (u && u.profile) 
        defaultCollaboration = u.profile.defaultCollaboration;

    names = names.sort();
    console.log(names);
    $(".collaboratorInitWithSelf").each(function() {
        var $this = $(this);
        if ($this.val() == "") {
            $this.val(this.name == "collaborators" ? defaultCollaboration: moi);
        }
    });


    // $(".collaboratorListClass").select2({tags: names});
    $(".collaboratorListClass").select2({
          initSelection : function (element, callback) {
            var data = element.val();
            if (data) {
		if (typeof data === 'string' || data instanceof String)
		   data = data.split(",");
		if (!Array.isArray(data)) 
		   data = [data];
                callback( data.map(function(g) { return { id: g, text: g }}) );
	    }
          },
	  tags: true,
	  tokenSeparators: [",", " "],
          multiple: true,
          ajax: {
            url:  "/collaborators",
            dataType: 'json',
            delay: 250,
            data: function (term) {
              var qp = {
                q: term
              };
              return qp;
            },
            results: function (data, page, query) { 
		console.log("results", data, page, query);
		if (data.items.length == 0) {
		   var term = query.term;
		   data.items = [ { id: term, text: term} ];
	        }
		return { results: data.items };
	    },
            cache: true
          },
          escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
          minimumInputLength: 3,
    });



    $(".form-control[name*='.']").select2({tags: names});
    $(".collaboratorListClass").addClass("allowToGrow");
    $(".form-control[name*='.']").addClass("allowToGrow");


    $('.collaboratorListClass').on("change", function(e){
	if (e.added) {
	   console.log(".collaboratorListClass change", e.added);
	}
    });
}

Template.collaborationAdd.hooks({ rendered: Sel })
Template.collaborationEdit.hooks({ rendered: Sel })

Template["collaborationReview"].events(  { 
    'click .cancelAndGoCollaborationList': goCollaborationlist ,

    'click .reviewCollaboration': function(event, tmpl) {

        $('.approved:checked').each(function() {
              var col = tmpl.data;
              Collaboration.update({_id: col._id}, 
                  { 
                    $addToSet: {collaborators: this.name},
                    $pull: {requests: this.name }
                  }
              );
         });

        $('.notApproved:checked').each(function() {
              var col = tmpl.data;
              Collaboration.update({_id: col._id}, { $pull: {requests: this.name }});
         });

        goCollaborationlist();

    }
});

Template["collaborationForm"].events(  { 
    'click .cancelAndGoCollaborationList': goCollaborationlist ,
    'click .removeCollaboration': function(event, tmpl) {
        var _id  =  $(event.target).data("_id");
        var name  =  $(event.target).data("name");
        
        if (confirm("Are you sure you want to remove " + name + "?")) {
          Collaboration.remove({_id: _id})
          goCollaborationlist();
        }
     }
});


AutoForm.hooks({
   addCollaboration: {
      onSuccess: function(formType, onResult) {
         console.log("addCollaboration onSuccess", formType, onResult);
	 Meteor.call("refreshUserProfileCollaborations");
      }
   }
});

