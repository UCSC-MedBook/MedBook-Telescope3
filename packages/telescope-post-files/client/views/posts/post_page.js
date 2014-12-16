Meteor.startup(function() {
    Template[getTemplate('post_page2')].replaces(getTemplate('post_page'))

    Template[getTemplate('post_page2')].helpers({
      post_item: function () {
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

    Template[getTemplate('post_page2')].rendered = function(){
      $('body').scrollTop(0);
      if(this.data) // XXX
        document.title = $(".post-title").text();
    };
});
