Template[getTemplate('postTitle')].helpers({
  postLink: function(){
    // return !!this.url ? getOutgoingUrl(this.url) : "/posts/"+this._id;
    return "/posts/"+this._id;
  },
  postTarget: function() {
    // return !!this.url ? '_blank' : '';
    return '';
  },
  TwoHours: function() {
     seconds = (Date.now() - this.createdAt)/1000;
     if (seconds < 7200) {
         return "TwoHours";
     }
     return "";
  }
});
