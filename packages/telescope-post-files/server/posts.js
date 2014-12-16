
postAfterSubmitMethodCallbacks.push(function(post){

    _.map( post.medbookfiles,
         function(fid) { 
            console.log("postAfterSubmitMethodCallbacks.push fid pid", fid,  post._id);
            Collections.Files.update({ _id: fid}, { $set: { post: post._id} })});

    return post;
});

