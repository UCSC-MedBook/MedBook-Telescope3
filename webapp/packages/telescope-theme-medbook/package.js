Package.describe({summary: "MedBook Theme package"});

Package.onUse(function (api) {

  api.add_files([
    'lib/client/stylesheets/screen.css',
    ], ['client']);

});
