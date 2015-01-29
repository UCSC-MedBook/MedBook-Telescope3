function isMember(id) {
    var col = Collaboration.findOne({_id: id});
    if (col == null) return false;
    var ad = col.collaborators;
    if (ad == null) return false;
    var em = Meteor.user().emails;
    for (var i = 0; i < em.length; i++)
        if (/* em[i].verified && */ ad.indexOf(em[i].address) >= 0)
            return true;
    return false;
}
function isAdministrator(id) {
    var col = Collaboration.findOne({_id: id});
    if (col == null) return false;
    var ad = col.administrators;
    if (ad == null) return true;
    if (ad.indexOf(Meteor.user().username) >= 0)
        return true;

    var em = Meteor.user().emails;
    for (var i = 0; i < em.length; i++)
        if (/* em[i].verified && */ ad.indexOf(em[i].address) >= 0)
            return true;
    return false;
}
function isCollaborator(id) {
    var col = Collaboration.findOne({_id: id});
    if (col == null) return false;
    var ad = col.administrators;
    if (ad == null) return true;
    var em = Meteor.user().emails;
    for (var i = 0; i < em.length; i++)
        if (/* em[i].verified && */ ad.indexOf(em[i].collaborators) >= 0)
            return true;
    return false;
}

Meteor.startup(
    function () {
        Template[getTemplate('collaborationGrid')].helpers({
            collaboration: function () {
                return Collaboration.find({}, {sort: {order: 1, name: 1}});
            }

        });

        Template[getTemplate('collaborationGrid')].hooks( {
            rendered: function() {
                var focusOn = Session.get("FocusName");
                console.log( "collaborationGrid rendered focusOn", focusOn);
                if (focusOn) {
                    var box = $("[name='"+focusOn+"']");
                    if (box && box.length > 0) {
                        $(".collaboration-focus").removeClass("collaboration-focus");
                        box.children().addClass("collaboration-focus");
                        var y = box.offset().top;
                        console.log("focusOn y=",y);
                        $('html, body').animate({ scrollTop:y }, 2000);
                    }
                }
            }
        });



        Template[getTemplate('collaborationGrid')].events( {

            'click button[name="join"]': function(evt) {
                evt.preventDefault();
                Meteor.call('joinCollaborationMethod', this._id, function (err) {
                    if (err) {
                        console.log('joinCollaborationMethod error', err);
                        alert("joinCollaborationMethod failed")
                    } else
                        alert("You are now part of the collaboration")
                });
            },
            'click button[name="leave"]': function(evt) {
                evt.preventDefault();

                Meteor.call('leaveCollaborationMethod', this._id, function (err) {
                    if (err) {
                        console.log('leaveCollaborationMethod error', err);
                        alert("leaveCollaborationMethod failed")
                    } else
                        alert("You have left the collaboration")
                });
            },

            'click input[type=submit]': 
                function(e) {
                    e.preventDefault();
                    var name = $('#name').val();
                    var slug = slugify(name);

                    Meteor.call('createCollaborationMethod',
                            {
                                name: name,
                                slug: slug
                            }, 
                            function (error, collaborationName) {
                                if (error) {
                                    console.log(error);
                                    throwError(error.reason);
                                    clearSeenErrors();
                                } else {
                                    $('#name').val('');
                                    // throwError('New collaboration "'+collaborationName+'" created');
                                }
                            }
                    );

                }
            });

        function prettyList(cols) {
           var answerSet = {};
           cols.map(function(col,i) {
               if (col.indexOf("@") < 0) {
                   var c = Collaboration.findOne({"_id":col});
                   if (c)
                       answerSet[c.name] = 1;
                   else
                       answerSet[col] = 1;
               } else {
                   var u = Meteor.users.findOne({"emails.address": col})
                   if (u && u.username)
                       answerSet[u.username] = 1;
                   else
                       answerSet[col] = 1;
               }
           });
           var a = Object.keys(answerSet).sort();
           console.log("cols", cols, a);
           return a.length > 0 ? a.join(" ") : " noone ";
        }

        Template[getTemplate('collaborationGridElement')].helpers({
            administrators: function() {
               var vv = prettyList(this.administrators);
               return vv;
            },
            collaborators: function() {
               return prettyList(this.collaborators);
            },
            isAdministrator: function () {
                return isAdministrator(this._id);
            },
            requiresApproval: function () {
                console.log("requiresApproval", this, Collaboration.findOne({_id: this._id}));
                var col = Collaboration.findOne({_id: this._id});
                return col.requiresApproval == true;
            },
            isPrivate: function () {
                var col = Collaboration.findOne({_id: this._id});
                return col.isPrivate == true;
            },
            isMember: function () {
                return isMember(this._id);
            }
        });

        Template[getTemplate('collaborationGridElement')].events({
            'keyup input[id="addCollaborators"]': addCollaborator,

            'click .collaborationRemove': function(tmpl, vent) {
                if (confirm("Are you sure you want to remove " + this.name + "?"))
                  Collaboration.remove({_id: this._id})
             }
        });
    }

);

