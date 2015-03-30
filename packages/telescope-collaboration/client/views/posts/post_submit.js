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
    Template[getTemplate('post_submit')].hooks( {
        rendered: function() {
            var posted_svg = parent.getSvg();
            console.log("posted_svg", posted_svg);
            if (posted_svg) {
                $('#postedContent').html("<div style='border:1px solid black;width:800;height:400px'> " 
                + '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="100%" height="100%" viewBox="0 0 1100 600" id="svg2" version="1.1" inkscape:version="0.48.0 r9654">'



                    + posted_svg + "</svg> <div>");
            }
        }
    });
    Template[getTemplate('post_submit-medbook')].replaces(getTemplate('post_submit'));
});
