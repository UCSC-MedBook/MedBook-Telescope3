Template[getTemplate('nav')].helpers({
  primaryNav: function () {
    return primaryNav;
  },
  hasPrimaryNav: function () {
    return !!primaryNav.length;
  },
  secondaryNav: function () {
    return secondaryNav;
  },
  hasSecondaryNav: function () {
    return !!secondaryNav.length;
  },
  dropdownClass: function () {
    return getThemeSetting('useDropdowns', true) ? 'has-dropdown' : 'no-dropdown';
  },
  getTemplate: function () {
    return getTemplate(this);
  },
  userMenu: function () {
    return getTemplate('userMenu');
  },
  site_title: function(){
    return getSetting('title');
  },
  logo_url: function(){
    return getSetting('logoUrl');
  },
  logo_top: function(){
    return Math.floor((70-getSetting('logoHeight'))/2);
  },  
  logo_offset: function(){
    return -Math.floor(getSetting('logoWidth')/2);
  },
  intercom: function(){
    return !!getSetting('intercomId');
  },
  canPost: function(){
    return canPost(Meteor.user());
  },
  requirePostsApproval: function(){
    return getSetting('requirePostsApproval');
  }
});

function fixMedBookImage() {
    var $mbi = $("#MedBookImage");
    $mbi.css({position:"absolute",top: -45, left:($("body").width()/2)-($mbi.width()/2)})
}
window.fixMedBookImage = fixMedBookImage;
$(window).resize( fixMedBookImage );

Template[getTemplate('nav')].rendered = function(){
  if(!Meteor.loggingIn() && !Meteor.user()){
    $('.login-link-text').text("Sign Up/Sign In");
  }
  fixMedBookImage();
};

Template[getTemplate('nav')].events({
  'mouseenter #MedBookImage': function(e) {
    // $('#MedBookMenuPoint').load("/menu")

    $.ajax({
      url: "/menu",
      success: function (data) { $(data).appendTo('body'); }, 
      dataType: 'html'
    });


    console.log("loaded")
  },

  'click #logout': function(e){
    e.preventDefault();
    Meteor.logout();
  },
  'click .mobile-menu-button': function(e){
    e.preventDefault();
    $('body').toggleClass('mobile-nav-open');
  },
  'click .login-header': function(e){
    e.preventDefault();
    Router.go('/account');
  },
  'click #login-name-link': function(){
    if(Meteor.user() && !$('account-link').exists()){
      var $loginButtonsLogout = $('#login-buttons-logout');
      // $loginButtonsLogout.before('<a href="/users/'+Meteor.user().slug+'" class="account-link button">View Profile</a>');
      $loginButtonsLogout.before('<a href="/account" class="account-link button">Edit Account</a>');
    }
  }
});
