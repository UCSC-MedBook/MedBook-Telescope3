

Meteor.startup(function () {

  Template.files.events({
    'click .toggle' : function() {
        $('#dirsButton').toggle();
        $('#filesButton').toggle();
    },
    'change input.any':  function(event, template) {

        var files = event.target.files;
        var map = {};
        for (var i = 0; i < files.length; i++)  {
            var rp = files[i].webkitRelativePath;
            if (rp == null || rp.length == 0)
                break
            map[files[i].name] = files[i].webkitRelativePath;
        }

        return FS.EventHandlers.insertFiles(Collections.Blobs, {
          metadata: function (fileObj) {
            return {
              owner: Meteor.userId(),
              // mime: mime.lookup(fileObj.name()),
              dropped: false
            };
          },
          after: function (error, fileObj) {
            var name = fileObj.name();
            if (name in map)
                fileObj.name(map[name])
            else
                fileObj.name(name)

            if (!error) {
              console.log("Inserted", fileObj.name());
            }
          }
        })(event, template);
  }});

  Template.uploadedFile.helpers( {
      getid : function() {
         return this._id;
      },
      previewFile : function(fileObj) {
         var mimetype = this.type();

         if (mimetype.match("image.*"))
             return Template["previewImage"];

         if (mimetype.match("text.*separated-values"))
            return Template["handsontablePreview"];

        return Template["noPreview"];
     }
  });

  Template.files.helpers( { 
      uploadedFiles : function() {
         return Collections.Blobs.find( {post: { $exists: false }, owner: Meteor.userId()} );
      },
  });

  Template.postedFiles.helpers({
      medbookfiles : function() {
         return Collections.Blobs.find({post: this._id});
      }
  });
  Template.handsontablePreview.events({
    'click .edit' : function(event, template) {
      var hot = $(template.find(".HOTdiv")).handsontable('getInstance');
      var settings =  {readOnly: false};
      var n = hot.countRows();
      if (n > 8)
          settings.height = n * 15;
      hot.updateSettings( settings );
     }
  });


  Template.handsontablePreview.rendered = function() {
      var template = this;
      var hotDiv = template.find('.HOTdiv');
      var url = template.data.url();
      $.get(url, function(data, status) {
          var split2 = data.split("\n").map(function (line) { return line.split("\t") });
          $(hotDiv).handsontable( { 
                readOnly: true,
                rowHeaders: true,
                colHeaders: true,
                height: 300,
                data: split2,

                afterChange: function (change, source) {
                  if (source === 'loadData') {
                    return; //don't save this change
                  }
                  var hot = $(template.find(".HOTdiv")).handsontable('getInstance');
                  var all = hot.getData().map(function(row) { return row.join("\t") }).join("\n") + "\n";
                  console.log("change", all);

                  $.ajax({ 
                      url: url, type: "PUT", data: all, 
                      success: function(result) { console.log("PUT success", url, result); },
                      error: function(result) { console.log("PUT error", url, result); }
                  });
                }
                
            } );
      });
  }

});

