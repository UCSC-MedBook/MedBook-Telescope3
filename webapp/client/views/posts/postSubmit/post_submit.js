Template[getTemplate('post_submit')].helpers({
  categoriesEnabled: function(){
    return Categories.find().count();
  },
  categories: function(){
    return Categories.find();
  },
  users: function(){
    return Meteor.users.find({}, {sort: {'profile.name': 1}});
  },
  userName: function(){
    return getDisplayName(this);
  },
  isSelected: function(user){
    return user._id == Meteor.userId() ? "selected" : "";
  },
  showPostedAt: function () {
    if(Session.get('currentPostStatus') == STATUS_APPROVED){
      return 'visible'
    }else{
      return 'hidden'
    }
    // return (Session.get('currentPostStatus') || STATUS_APPROVED) == STATUS_APPROVED; // default to approved
  }
});

Template[getTemplate('post_submit')].rendered = function(){
  // run all post submit rendered callbacks
  var instance = this;
  postSubmitRenderedCallbacks.forEach(function(callback) {
    callback(instance);
  });

  Session.set('currentPostStatus', STATUS_APPROVED);
  Session.set('selectedPostId', null);
  if(!this.editor && $('#editor').exists())
    this.editor= new EpicEditor(EpicEditorOptions).load();

  $('#postedAtDate').datepicker();

  // $("#postUser").selectToAutocomplete(); // XXX

};

Template[getTemplate('post_submit')].events({
  'change input[name=status]': function (e, i) {
    Session.set('currentPostStatus', e.currentTarget.value);
  },
  'click input[type=submit]': function(e, instance){
    e.preventDefault();

    $(e.target).addClass('disabled');

    // ------------------------------ Checks ------------------------------ //

    if(!Meteor.user()){
      throwError(i18n.t('you_must_be_logged_in'));
      return false;
    }

    // ------------------------------ Properties ------------------------------ //

    // Basic Properties

    console.log("Meteor.userId()", Meteor.userId());
    console.log("getDisplayNameById", getDisplayNameById(Meteor.userId()));



    var post = {
      title: $('#title').val(),
      body: $('#postBody').val(),
      sticky: $('#sticky').is(':checked'),
      userId: $('#postUser').val(),
      status: 2,
      author: getDisplayNameById(Meteor.userId()),
      userId: Meteor.userId(),
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      clickCount: 0,
      viewCount: 0,
      baseScore: 0,
      score: 0,
      inactive: false,
      collaboration: []
      /*timeSinceLastPost=timeSinceLast(user, Posts),
      numberOfPostsInPast24Hours=numberOfItemsInPast24Hours(user, Posts),
      postInterval = Math.abs(parseInt(getSetting('postInterval', 30))),
      maxPostsPer24Hours = Math.abs(parseInt(getSetting('maxPostsPerDay', 30))),*/
    };


    /*var $svg = $('svg');
    if ($svg.length > 0) {
        post.svg =  $svg.parent().html(); //  depend on the SVG to be the only element in the div
    }*/

    // PostedAt

    var $postedAtDate = $('#postedAtDate');
    var $postedAtTime = $('#postedAtTime');
    var setPostedAt = false;
    var postedAt = new Date(); // default to current browser date and time
    var postedAtDate = $postedAtDate.datepicker('getDate');
    var postedAtTime = $postedAtTime.val();

    if ($postedAtDate.exists() && postedAtDate != "Invalid Date"){ // if custom date is set, use it
      postedAt = postedAtDate;
      setPostedAt = true;
    }

    if ($postedAtTime.exists() && postedAtTime.split(':').length==2){ // if custom time is set, use it
      var hours = postedAtTime.split(':')[0];
      var minutes = postedAtTime.split(':')[1];
      postedAt = moment(postedAt).hour(hours).minute(minutes).toDate();
      setPostedAt = true;
    }

    if(setPostedAt) // if either custom date or time has been set, pass result to post
      post.postedAt = postedAt;


    // URL

    var url = $('#url').val();
    if(!!url){
      var cleanUrl = (url.substring(0, 7) == "http://" || url.substring(0, 8) == "https://") ? url : "http://"+url;
      post.url = cleanUrl;
    }

    // ------------------------------ Callbacks ------------------------------ //

    // run all post submit client callbacks on post object successively
    /*post = postSubmitClientCallbacks.reduce(function(result, currentFunction) {
        return currentFunction(result);
    }, post);*/


    post.collaboration.push($('#postSubmitPage .selectCollaborators .select2-search-choice div').text());


    Meteor.call("logPost", post);
    //console.log("post", post);

    // ------------------------------ Insert ------------------------------ //
    if (post) {

      /*var title = cleanUp(post.title),
          body = post.body,
          svg = post.svg,
          userId = this.userId,
          user = Meteor.users.findOne(userId),
          timeSinceLastPost=timeSinceLast(user, Posts),
          numberOfPostsInPast24Hours=numberOfItemsInPast24Hours(user, Posts),
          postInterval = Math.abs(parseInt(getSetting('postInterval', 30))),
          maxPostsPer24Hours = Math.abs(parseInt(getSetting('maxPostsPerDay', 30))),
          postId = '';
*/

      // check that user can post
      // ISSUE:  User shouldn't have post button if they going to be denied anyhow.
      // ISSUE:  Add allow/deny rules for Posts collection.
      // ISSUE:  Confirm isomorphic Posts.createdAt pattern works with latency compensatio.
      // ISSUE:  Add cfs packages back in (with QA coverage this time!)
      // ISSUE:


      //console.log("before insert post.medbookfiles", post.medbookfiles);
      Posts.insert(post, function(error, result){

        Meteor.call("logMethodResults", "Posts.insert()", error, result);

        if(error){
          console.log("error", error);
        }
        if(result){
          console.log("result", result);
          Router.go('/posts/' + result, function(error, result){
            Meteor.call("logMethodResults", "Router.go()", error, result);
            console.log("[Router.go] error", error);
            console.log("[Router.go] result", result);
          });
        }
        console.log("after insert post.medbookfiles", post.medbookfiles);

        //
        console.log("find after insert post.medbookfiles", Posts.find({_id: result}).fetch());

        // increment posts count
        Meteor.users.update({_id: Meteor.userId()}, {$inc: {postCount: 1}});

        Meteor.call('upvotePost', post, Meteor.users.findOne(post.userId));
      });


      //console.log("postId", postId);

      /*
      //======================================================================
      // ORIGINAL FUNCTION

      /*Meteor.call('post', post, function(error, postId) {
        if(error){
          throwError(error.reason);
          clearSeenErrors();
          $(e.target).removeClass('disabled');
          //if(error.error == 603)
          //Router.go('/posts/' + postId);
        }else{
          //trackEvent("new post", {'postId': post._id});
          //if(post.status === STATUS_PENDING)
          //  throwError('Thanks, your post is awaiting approval.');
          Router.go('/posts/' + postId);
        }
      });*/
    } else {
      $(e.target).removeClass('disabled');
    }

  },
  'click .get-title-link': function(e){
    e.preventDefault();
    var url=$("#url").val();
    var $getTitleLink = $(".get-title-link");
    $getTitleLink.addClass("loading");
    if(url){
      $.get(url, function(response){
          if ((suggestedTitle=((/<title>(.*?)<\/title>/m).exec(response.responseText))) != null){
              $("#title").val(suggestedTitle[1]);
          }else{
              alert("Sorry, couldn't find a title...");
          }
          $getTitleLink.removeClass("loading");
       });
    }else{
      alert("Please fill in an URL first!");
      $getTitleLink.removeClass("loading");
    }
  },

  'keyup #new_category' : function(e, i) {
      if (event.which === 27 || event.which === 13) {
          e.preventDefault();
          e.target.blur();

          var name = e.currentTarget.value;
          var slug = slugify(name);

          Meteor.call('category', {
              name: name,
              order: 1,
              slug: slug
          }, function(error, categoryName) {
                if (error){
                    console.log(error);
                    throwError(error.reason);
                    clearSeenErrors();
                } else {
                    e.currentTarget.value = "";
                    // throwError('New category "'+categoryName+'" created');
                }
          });
      }
    },
  });
Template[getTemplate('post_submit')].hooks( {
  rendered: function() {
      if (parent.document.medbookpost) {
          var mp = parent.document.medbookpost;
          $('#title').val(mp.title);
          $('#body').val(mp.body);
          $('#medbookfiles').val(mp.medbookfiles.join(","));
      }
      var $svg = (parent != window) && parent.getSvg ? parent.getSvg() : null;
      if ($svg) {
          var width = $svg.width();
          var height = $svg.height();
          var html = $svg.html();

          $('#postedContent').html("<div style='border:1px solid black;width:800;height:400px'> "
            + '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="100%" height="100%" viewBox="0 0 ' + width + ' ' +  height + '" id="svg2" version="1.1" inkscape:version="0.48.0 r9654">'
            + html + "</svg> </div>");
      }
  }
});
