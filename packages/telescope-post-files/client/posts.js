function uploadFiles(doc) {
    doc.medbookfiles = _.map($(".MedBookFile"), function(f) { return  $(f).data("_id") });
}

postSubmitClientCallbacks.push(function(post) {
    uploadFiles(post);
    console.log("postSubmitClientCallbacks post.medbookfiles", post.medbookfiles);
    return post;
    });


postSubmitMethodCallbacks.push(function(post) {
    uploadFiles(post);
    console.log("postSubmitMethodCallbacks post.medbookfiles", post.medbookfiles);
    return post;
    });

postEditMethodCallbacks.push(function(post){
    return post;
});

/*

postAfterEditMethodCallbacks.push(function(post) {
    return post;

});
*/

