Meteor.startup(function() {
    Template[getTemplate('posts_list-medbook')].helpers({
      post_item: function () {
        return getTemplate('post_item-medbook');
      },
      posts : function () {
        if(this.postsList){ // XXX
          this.postsList.rewind();    
          var posts = this.postsList.map(function (post, index, cursor) {
            post.rank = index;
            return post;
          });
          return posts;
        }
      },
      collaborationName: function() {
        var slug = Session.get("collaborationSlug")
        if (slug  && slug.length > 0) {
          var col = Collaboration.findOne({slug: slug});
          if (col)
            return col.name;
        }
        return null;
      },
      postsLoadMore: function () {
        return getTemplate('postsLoadMore');
      },
      postsListIncoming: function () {
        return getTemplate('postsListIncoming');
      }
    });

    Template[getTemplate('posts_list-medbook')].created = function() {
      Session.set('listPopulatedAt', new Date());
    };
    Template[getTemplate('posts_list-medbook')].replaces('posts_list');
});
