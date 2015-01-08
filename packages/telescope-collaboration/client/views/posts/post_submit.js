Meteor.startup( function() {
    Template[getTemplate('post_submit-medbook')].inheritsHelpersFrom('post_submit');
    Template[getTemplate('post_submit-medbook')].inheritsEventsFrom('post_submit');
    Template[getTemplate('post_submit-medbook')].events({
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
    Template[getTemplate('post_submit-medbook')].replaces(getTemplate('post_submit'));
});
