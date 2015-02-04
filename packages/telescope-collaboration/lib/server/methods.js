
function TelescopePost(post, userId, isSimulation){
    var title = cleanUp(post.title),
        body = post.body,
        userId = userId,
        user = Meteor.users.findOne({_id: userId}),
        timeSinceLastPost=timeSinceLast(user, Posts),
        numberOfPostsInPast24Hours=numberOfItemsInPast24Hours(user, Posts),
        postInterval = Math.abs(parseInt(getSetting('postInterval', 30))),
        maxPostsPer24Hours = Math.abs(parseInt(getSetting('maxPostsPerDay', 30))),
        postId = '';

    console.log("TelescopePost 13");

    // ------------------------------ Checks ------------------------------ //

    // check that user can post
    if (!user || !canPost(user))
      throw new Meteor.Error(601, i18n.t('You need to login or be invited to post new stories.'));

    // check that user provided a title
    if(!post.title)
      throw new Meteor.Error(602, i18n.t('Please fill in a title'));


    if(!!post.url){
      // check that there are no previous posts with the same link in the past 6 months
      var sixMonthsAgo = moment().subtract(6, 'months').toDate();
      var postWithSameLink = Posts.findOne({url: post.url, postedAt: {$gte: sixMonthsAgo}});

      if(typeof postWithSameLink !== 'undefined'){
        Meteor.call('upvotePost', postWithSameLink);
        throw new Meteor.Error(603, i18n.t('This link has already been posted'), postWithSameLink._id);
      }
    }

    console.log("TelescopePost 37");
    /*
    if(!isAdmin(Meteor.user())){
      // check that user waits more than X seconds between posts
      if(!isSimulation && timeSinceLastPost < postInterval)
        throw new Meteor.Error(604, i18n.t('Please wait ')+(postInterval-timeSinceLastPost)+i18n.t(' seconds before posting again'));

      // check that the user doesn't post more than Y posts per day
      if(!isSimulation && numberOfPostsInPast24Hours > maxPostsPer24Hours)
        throw new Meteor.Error(605, i18n.t('Sorry, you cannot submit more than ')+maxPostsPer24Hours+i18n.t(' posts per day'));
    }
    */

    // ------------------------------ Properties ------------------------------ //

    console.log("TelescopePost 52");
    // Basic Properties
    properties = {
      title: title,
      body: body,
      userId: userId,
      author: getDisplayNameById(userId),
      upvotes: 0,
      downvotes: 0,
      commentsCount: 0,
      baseScore: 0,
      score: 0,
      inactive: false
    };

    console.log("TelescopePost 67");
    properties.userId = post.userId;
    console.log("TelescopePost 69");

    properties.status = 2;

    // CreatedAt
    properties.createdAt = new Date();
    console.log("TelescopePost 73");

    // PostedAt
    properties.postedAt = new Date();

    post = _.extend(post, properties);

    // ------------------------------ Callbacks ------------------------------ //

    console.log("TelescopePost 82");
    // run all post submit server callbacks on post object successively
    post = postSubmitMethodCallbacks.reduce(function(result, currentFunction) {
        return currentFunction(result);
    }, post);
    console.log("TelescopePost 87");

    // ------------------------------ Insert ------------------------------ //

    // console.log(post)
    console.log("TelescopePost 94");
    post._id = Posts.insert(post);
    console.log("TelescopePost 96");

    // ------------------------------ MedBook Post Files ----------------------- //
    if (post.blobs && post.blobs.length >0)
       for (var i = 0; i < post.blobs.length; i++)  {
          var fid = post.blobs[i];
          FileUploadCollection.update({"_id": new Meteor.Collection.ObjectID(fid)}, { "$set" : { "postId" : post._id } })
       }


    // ------------------------------ Callbacks ------------------------------ //

    // run all post submit server callbacks on post object successively
    post = postAfterSubmitMethodCallbacks.reduce(function(result, currentFunction) {
        return currentFunction(result);
    }, post);

    // ------------------------------ Post-Insert ------------------------------ //

    // increment posts count
    Meteor.users.update({_id: userId}, {$inc: {postCount: 1}});

    var postAuthor =  Meteor.users.findOne({_id: post.userId});

    Meteor.call('upvotePost', post, postAuthor);

    return post;
  }
function MedBookPost(post,userId) {
    // ------------------------------ Properties ------------------------------ //

    // Basic Properties

    console.log("MedBookPost");

    // ------------------------------ Insert Post ----------------------- //
    post._id = Posts.insert(post);

    // ------------------------------ MedBook Post Files ----------------------- //
    if (post.blobs && post.blobs.length >0)
        for (var i = 0; i < post.blobs.length; i++)  {
            var fid = post.blobs[i];
            FileUploadCollection.update({"_id": new Meteor.Collection.ObjectID(fid)}, { "$set" : { "postId" : post._id } })
        }


    // ------------------------------ Callbacks ------------------------------ //

    // run all post submit server callbacks on post object successively
    post = postAfterSubmitMethodCallbacks.reduce(function(result, currentFunction) {
        return currentFunction(result);
    }, post);

    // ------------------------------ Post-Insert ------------------------------ //

    // increment posts count
    Meteor.users.update({_id: userId}, {$inc: {postCount: 1}});
    var postAuthor =  Meteor.users.findOne({_id:post.userId});
    Meteor.call('upvotePost', post, postAuthor);
    return post._id;
}

var moi = function() {
    var user;
    if (Meteor.isClient)
        user = Meteor.user();
    else
        user = Meteor.users.findOne({_id: this.userId});
    var cols = [];
    if (user) {
        cols.push(user.username);
        _.map( getEmails(), function(em) { cols.push(em);});
    }

    console.log("moi", cols);
    return cols;
}



function refreshUserProfileCollaborations(user) {
    console.log(" user: ", user)
    if (user == null)
        return;
    if (user.emails == null)
        return;
    var emails = getEmailsFor(user);
    console.log( "refreshUserProfileCollaborations emails", emails);
    var collaborationLookupQueue = Collaboration.find({collaborators: {$in: emails}}, {fields:{name:1}}).fetch();
    collaborationLookupQueue = collaborationLookupQueue.map(function(f){ return f.name});
    console.log( "refreshUserProfileCollaborations collaborationLookupQueue", collaborationLookupQueue);
    var collaborationSet = {};

    // transitive closure queue method
    for (var i = 0; i < collaborationLookupQueue.length; i++) {
        var name = collaborationLookupQueue[i];
        if (!(name in collaborationSet)) {
            var col = Collaboration.findOne({name: name}, {fields:{collaborators:1}});
            if (col) {
                collaborationSet[name] = col._id; // cheap implementation of a set.
                var refs = col.collaborators;
                console.log( "refreshUserProfileCollaborations refs", refs);
                if (refs)
                    for (var j = 0; j < refs.length; j++)
                        collaborationLookupQueue.push(refs[i]);
            }
        }
    }
    var collaborations = Object.keys(collaborationSet).sort();
    console.log( "refreshUserProfileCollaborations collaborations", user._id,  collaborations);
    ret = Meteor.users.update( user._id, {$set: { "profile.collaborations": collaborations}});
    console.log("update ret", ret);
}


Meteor.startup(function () {


  Meteor.methods({
    createCollaborationMethod: function(collaboration){
              console.log(collaboration)
              if (!Meteor.user())
                  throw new Meteor.Error(i18n.t('You need to login to add a new collaboration.'));
              collaboration.slug = slugify(collaboration.name);

              Collaboration.insert(collaboration);
              return collaboration.name;
          },
    joinCollaborationMethod: function(collaboration_id) {
          console.log("joinCollaborationMethod")
          var cols = moi.call(this);
          Collaboration.update({_id: collaboration_id}, { $addToSet: { collaborators:{$each: cols}, administrators:{$each: cols} }}, function (err, err2){
                  console.log("joinCollaborationMethod Collaboration.update", collaboration_id, cols, err, err2)
              }
          );
          refreshUserProfileCollaborations(Meteor.users.findOne({_id: this.userId}));

      },
    applyCollaborationMethod: function(collaboration_id) {
          console.log("applyCollaborationMethod")
          var cols = moi.call(this);
          Collaboration.update({_id: collaboration_id}, { $addToSet: { requests:{$each: cols} }}, function (err, err2){
                  console.log("applyCollaborationMethod Collaboration.update", collaboration_id, cols, err, err2)
              }
          );
      },
    leaveCollaborationMethod: function(collaboration_id) {
        console.log("leaveCollaborationMethod")
        var cols = moi.call(this);
        Collaboration.update({_id: collaboration_id}, { $pull: { collaborators: {$in: cols}, administrators: {$in: cols }}}, function (err, err2){
              console.log("joinCollaborationMethod Collaboration.update", collaboration_id, cols, err, err2)
            }
        );
          refreshUserProfileCollaborations(Meteor.users.findOne({_id: this.userId}));
    },

  });

function parseCookies (cookiesString) {
    var cookies = {};

    cookiesString.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        cookies[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return cookies;
}


var querystring =  Npm.require("querystring")
  HTTP.methods({
     medbookUser: function(data){
        data = String(data)
        var token = null;
        if (data) {
            console.log("medbookUser", data);
            var qs = querystring.parse(data);
            if (qs && qs.token)
                token = qs.token;
        }
        if (token == null && this.requestHeaders.cookie && this.requestHeaders.cookie.length > 0) {
            var c = parseCookies(this.requestHeaders.cookie);
            if (c && 'meteor_login_token' in c && c['meteor_login_token'].length > 0)
                token = c['meteor_login_token'];
        }
        if (token == null)
            return"";



        var user = Meteor.users.findOne({
            $or: [
                {'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(token)},
                {'services.resume.loginTokens.token': token}
            ]
        });
        if (user == null)
            return;

        var email = null;
        if (user && user.emails && user.emails.length > 0)
            email = user.emails[0].address
        console.log("user.services", user.services);
        if (user.services && user.services.google && user.services.google.email)
            email = user.services.google.email;
        if (email == null)
            email = "none";

        refreshUserProfileCollaborations(user); // might be too heaveyweight

        var responseObj = {
            email : email,
            username: user.username,
            collaborations: user.profile.collaborations,
        };

        var response = JSON.stringify(responseObj);
        console.log("medbookUser response=", response);
        this.setStatusCode(200)
        return response;
    },
    medbookPost: function(data){
        var qs = querystring.parse(String(data));

        var user = Meteor.users.findOne({
            $or: [
                {'services.resume.loginTokens.hashedToken': Accounts._hashLoginToken(qs.token)},
                {'services.resume.loginTokens.token': qs.token}
            ]
        });

        if (user == null) {
            this.setStatusCode(401); // Unauthorized
            return { state: "failed", reason: "token not found" }
        }
        this.setUserId(user._id)

        var post = JSON.parse(qs.json);
        post.userId   = user._id;
        post.sticky   = false;
        post.status   = STATUS_APPROVED;
        post.postedAt = new Date();
        post.createdAt = post.postedAt;
        post.commentsCount = 0;
        post.downvotes = 0;
        post.inactive = false;
        post.score = 0;
        post.upvotes = 0;
        console.log("post", post)

        // TelescopePost(post, post.userId, false);
        var _id = MedBookPost(post, post.userId);
        return { state: "success", _id: _id}
     }
  });

  Accounts.onLogin(
      function(args) {
        console.log("onLogin", args.user.username);
          refreshUserProfileCollaborations(args.user);
      }
  );

});
