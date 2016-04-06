Package.describe({summary: "MedBook Collaboration   package"});

Package.onUse(function (api) {

  api.use(['telescope-lib', 'telescope-base', 'aldeed:simple-schema', 'telescope-theme-hubble'], ['client', 'server']);

  api.use([
    'telescope-post-files',
    'coffeescript',
    'jquery',
    'http',
    'cfs:http-methods',
    'aldeed:http',
    'aldeed:template-extension',
    'underscore',
    'iron:router',
    'templating',
    'vsivsi:file-collection',
    'telescope-i18n',
    'pfafman:font-awesome-4',
    // 'aldeed:autoform-select2@1.0.4',
    // 'yogiben:autoform-tags',
  ], 'client');

  /*
  // NEW i18n support
  api.use([
    'tap:i18n'
  ], ['client', 'server']);
  */

  api.add_files(['lib/collaboration.js'], ['client', 'server']);


  api.add_files([
    'lib/client/routes.js',
    'lib/client/views/collaboration.css',
    'lib/client/views/collaboration.html',
    'lib/client/views/collaboration.js',
    'lib/client/views/collaboration_item.css',
    'lib/client/views/collaboration_item.html',
    'lib/client/views/collaboration_item.js',
    'lib/client/views/collaboration_menu.html',
    'lib/client/views/collaboration_menu.js',
    'lib/client/views/post_collaboration.html',
    'lib/client/views/post_collaboration.css',
    'lib/client/views/post_collaboration.js',

    'lib/client/views/select2.js',
    'lib/client/views/select2.css',
    'lib/client/views/select2.png',

  ], ['client']);

  api.add_files(['lib/server/publications.js', 'lib/server/methods.js'], ['server']);

  api.export(['refreshAllUserCollaborations', 'refreshUserProfileCollaborations', 'addCollaborator', 'getCollaborations', 'Collaboration', 'show', 'hide', 'createCollaboration', 'collaborationSchema', 'Schemas']);
});
