Meteor.methods(
  {
  loginGalaxyUser: function (galaxyUser)
    {
       if (galaxyUser == null || galaxyUser.length < 5)
          return null;
       if (galaxyUser.length > 0 && galaxyUser[0] == '"' && galaxyUser[galaxyUser.length-1])
          galaxyUser = galaxyUser.substr(1, galaxyUser.length-2);

       components = galaxyUser.split("~");
       if (components.length == 3) {
           var username = components[0];
           var email = components[1];
           var hash = CryptoJS.SHA256(username +"~"+email);
           hash = hash.toString(CryptoJS.enc.Hex);
           if (hash == components[2]) {
                console.log("CRYPTO components", hash, components);
                var meteorUser = Meteor.users.findOne({username: username, "profile.galaxy": true, "emails.address": email});
                if (meteorUser)  {
                    meteorUser = {
                      username: meteorUser.username,
                      email: meteorUser.email,
                      profile: { 
                         galaxy: true, 
                         password: meteorUser.profile.password,
                      },
                      password: meteorUser.profile.password,
                    }
                    return meteorUser;
                } else  {
                    var password = Meteor.uuid();
                    meteorUser = {
                      username: username,
                      email: email,
                      profile: { 
                         galaxy: true, 
                         password: password,
                      },
                      password: password,
                    };
                    Accounts.createUser(meteorUser);
                    return meteorUser;
              }
          }
      return null;
      }
    }
  }
);
