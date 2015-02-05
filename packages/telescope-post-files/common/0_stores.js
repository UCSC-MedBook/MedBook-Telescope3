Stores = {};

if (Meteor.isServer) {
    var mime = Npm.require("mime");
    Stores.any = new FS.Store.GridFS("any",
        {
            beforeWrite: function(fileObj) { 

            // HANDLE SPECIAL MEDBOOK MIME TYPES
                if (fileObj.original.type == "") {
                    var name = fileObj.name();
                    var type;

                    if (name.match(/\.tab$/))
                        type = 'text/tab-separated-values';
                    else
                        type = mime.lookup(name);

                    fileObj.type(type);

                }
            }
        }
    );
} else
    Stores.any = new FS.Store.GridFS("any");

