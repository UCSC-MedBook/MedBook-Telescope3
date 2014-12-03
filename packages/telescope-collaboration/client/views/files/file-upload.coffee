############################################################
# Client-only code
############################################################


Meteor.startup () ->

   Template.FileUploadCollection.rendered = () ->
      # This assigns a file drop zone to the "file table"
      FileUploadCollection.resumable.assignDrop $(".fileDrop")

      window.postSubmitClientCallbacks.push(getUploadedFiles);
      window.postEditClientCallbacks.push(getUploadedFiles);



   ################################
   # Setup resumable.js in the UI


   # When a file is added
   FileUploadCollection.resumable.on 'fileAdded', (file) ->
      # Keep track of its progress reactivaly in a session variable
      Session.set file.uniqueIdentifier, 0
      # Create a new file in the file collection to upload to
      metadata = {
            _id: file.uniqueIdentifier    # This is the ID resumable will use
            filename: file.fileName
            contentType: file.file.type
      }
      $postfolder = $(".postfolder");
      if $postfolder? and $postfolder.length == 1
          metadata.postId = $postfolder.data("postid");
          console.log "adding with postId", metadata.postId

      FileUploadCollection.insert(metadata, (err, _id) ->
            if err
               console.warn "File creation failed!", err
               return
            # Once the file exists on the server, start uploading
            FileUploadCollection.resumable.upload()
      )

   # Update the upload progress session variable
   FileUploadCollection.resumable.on 'fileProgress', (file) ->
      Session.set file.uniqueIdentifier, Math.floor(100*file.progress())

   # Finish the upload progress in the session variable
   FileUploadCollection.resumable.on 'fileSuccess', (file) ->
      uf = Session.get "uploadedFiles"
      if !uf?
          uf = []
      uf.push(file.uniqueIdentifier)
      console.log "success"
      Session.set "uploadedFiles", uf
      Session.set file.uniqueIdentifier, undefined

   # More robust error handling needed!
   FileUploadCollection.resumable.on 'fileError', (file) ->
      console.warn "Error uploading", file.uniqueIdentifier
      Session.set file.uniqueIdentifier, undefined

# Set up an autorun to keep the X-Auth-Token cookie up-to-date and
# to update the subscription when the userId changes.
Deps.autorun () ->
  userId = Meteor.userId()
  Meteor.subscribe 'allData', userId
  $.cookie 'X-Auth-Token', Accounts._storedLoginToken()

#####################
# UI template helpers

shorten = (name, w = 16) ->
  w++ if w % 2
  w = (w-2)/2
  if name.length > w
     name[0..w] + '...' + name[-w-1..-1]
  else
     name

Template.FileUploadCollection.events
  # Wire up the event to remove a file by clicking the `X`
  'click .del-file': (e, t) ->
     # Just the remove method does it all
     FileUploadCollection.remove {_id: this._id}

Template.FileUploadCollection.dataEntries = () ->
  # Reactively populate the table
  post = $(".post");
  if post? and post.length > 1
      query = {postId: this._id}
  else
      query = { 'metadata._Resumable': { $exists: false }, 'postId' : {$exists: false } }
  ll= FileUploadCollection.find(query).fetch();
  console.log "dataEntries",  query,  ll
  FileUploadCollection.find(query)

Template.FileUploadCollection.shortFilename = (w = 16) ->
  # shorten this.filename, w
  this.filename

Template.FileUploadCollection.owner = () ->
  this.metadata?._auth?.owner

Template.FileUploadCollection.id = () ->
  "#{this._id}"

Template.FileUploadCollection.link = () ->
  return FileUploadCollection.baseURL + "/" + this.md5

Template.FileUploadCollection.uploadStatus = () ->
  percent = Session.get "#{this._id}"
  unless percent?
     "Processing..."
  else
     "Uploading..."

Template.FileUploadCollection.formattedLength = () ->
  numeral(this.length).format('0.0b')

Template.FileUploadCollection.uploadProgress = () ->
  percent = Session.get "#{this._id}"

Template.FileUploadCollection.isImage = () ->
  types =
     'image/jpeg': true
     'image/png': true
     'image/gif': true
     'image/tiff': true
  types[this.contentType]?

Template.FileUploadCollection.loginToken = () ->
  Meteor.userId()
  Accounts._storedLoginToken()

Template.FileUploadCollection.userId = () ->
  Meteor.userId()

getUploadedFiles = (properties) ->
  console.log  "getUploadedFiles", properties
  uf = Session.get "uploadedFiles";
  if uf
      properties.uploadedFiles = uf
  return properties


