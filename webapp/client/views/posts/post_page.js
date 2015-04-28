Template[getTemplate('post_page')].helpers({
  post_item: function () {
    Session.set("current_id", this._id);
    return getTemplate('post_item');
  },
  post_body: function () {
    return getTemplate('post_body');
  },
  comment_form: function () {
    return getTemplate('comment_form');
  },
  comment_list: function () {
    return getTemplate('comment_list');
  }
});

function GoAdjacent(which) {
   var map = Session.get(which);
   var _id = Session.get("Post_id");
   var url = null;
   if (map && _id && _id in map) {
       var adjacent_id = map[_id];
       if (adjacent_id)  {
           setTimeout(function() {
               Router.go("post_page", {_id: adjacent_id});
           },200);
           return;
       }
   } 

   var orig = Session.get("PostOriginalRoute");
   if (orig)
       url = orig;

   if (url == null) url = "/";
   setTimeout(function() {
       Router.go(url);
   },200);
}


Template[getTemplate('post_page')].rendered = function(){
  $('body').scrollTop(0);
  if(this.data) // XXX
    document.title = $(".post-title").text();

  $('.Previous').click(function() {
    GoAdjacent("Previous")
  });
  $('.Next').click(function() {
    GoAdjacent("Next")
  });
       
};

