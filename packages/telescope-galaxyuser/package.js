Package.describe({
	summary: "Automatically add  or login a Galaxy User",
	version: "0.0.1",
	name: "ucscmedbook:telescope-galaxyuser",
	git: ""
});

Package.onUse(function (api) {
	api.versionsFrom("METEOR@0.9.0");
	api.use(['accounts-base', 'accounts-password','deps', 'blaze@2.0.3', "chuangbo:cookie" ], 'client');
	api.use(['accounts-base', 'jparker:crypto-sha256'], 'server');
	api.add_files('server.js', 'server');
	api.add_files('client.js','client');

});
