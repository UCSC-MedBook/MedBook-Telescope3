if (Package.blaze) {
  /**
   * @global
   * @name  currentUser
   * @isHelper true
   * @summary Calls [Meteor.user()](#meteor_user). Use `{{#if currentUser}}` to check whether the user is logged in.
   * Where "logged in" means The user has has authenticated (e.g. through providing credentials)
   */
  Package.blaze.Blaze.Template.registerHelper('currentUser', function () {
    var user = Meteor.user();
    if (user &&
        typeof user.profile !== 'undefined' &&
        typeof user.profile.galaxy !== 'undefined' &&
        user.profile.galaxy){
      return user.profile.galaxy;
    }else{
      return Meteor.user();
    }
  });
}


Meteor.loginGalaxyUser = function (email) {
        if (!Meteor.userId()) {
                var galaxyUser  = Cookie.get("GALAXYUSER");
                Cookie.remove("GALAXYUSER");
                Meteor.call('loginGalaxyUser', galaxyUser, function (error, result) {
                        if (error) {
                                console.log('Error in creating Galaxy user ' + error);
                                return false;
                        }
                        Meteor.loginWithPassword(result.username, result.password, function(err){
                                if(err){
                                        console.log('Error logging in '+err);
                                        return false;
                                }
                        });
                        return true;
                });
        }
}

Meteor.startup(function(){
        Deps.autorun(function () {

                if (Meteor.userId()) {
                        //			console.log('this is '+Meteor.userId());
                } else {
                        Meteor.loginGalaxyUser();
                }
        });
});
