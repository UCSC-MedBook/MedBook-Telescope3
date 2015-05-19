Package.describe({summary: "Telescope share files using posts package"});

Npm.depends({mime: "1.2.11"});


Package.onUse(function (api) {

  api.use([

    'aldeed:simple-schema',
    'aldeed:autoform',
    'aldeed:collection2',
    'aldeed:template-extension',

    'cfs:autoform',
    'cfs:filesystem',
    'cfs:graphicsmagick',
    'cfs:gridfs',
    'cfs:s3',
    'cfs:standard-packages',
    'cfs:ui',
    'iron:router',
    'meteor-platform',
    'mizzao:bootstrap-3',
    'mrt:jquery-easing',
    'mrt:numeral',

    'patte:mime-npm',
    'olragon:handsontable',


    'raix:ui-dropped-event',
    'sacha:spin',

    'telescope-lib', 
    'telescope-base', 
    'tap:i18n'
  ], ['client', 'server']);

  api.use([
    'jquery',
    'underscore',
    'iron:router',
    'templating'
  ], 'client');

  api.add_files([
    // 'package-tap.i18n'
  ], ['client', 'server']);

  api.add_files([
    'client/main.js',
    'client/subscribe.js',
    'client/views/autoform/autoform.html',
    'client/views/autoform/autoform.js',
    'client/views/files/files.html',
    'client/views/files/files.js',
    'client/views/files/files.css',
    'client/views/home/home.html',
    'client/views/home/home.js',
    'client/views/images/images.css',
    'client/views/images/images.html',
    'client/views/images/images.js',

    'client/views/posts/post_page.html',
    'client/views/posts/post_page.js',
    'client/views/posts/post_page.css',

    'client/posts.js',
    ], ['client']);

  api.add_files([
    'server/files.js',
    'server/main.js',
    'server/publish.js',
    'server/posts.js',
    'server/security.js',
  ], ['server']);

  api.add_files([
    'common/0_stores.js',
    'common/1_collections.js',
    'common/common.js',
    'common/routes.js',
    'common/posts.js',
    'common/extend.js',
  ], ["client", "server"]);
 
  api.export(['preloadSubscriptions', 'adminNav', 'Categories', 'addToPostSchema', 'primaryNav', 'postModules', 'Collections', 
          'AutoForm', 'FS']);
});
