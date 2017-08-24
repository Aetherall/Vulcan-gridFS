Package.describe({
	name: 'omni:uploadfs'
});

Npm.depends({ gm: '1.23.0' });

Package.onUse(function(api) {
	api.use(['vulcan:core', 'vulcan:forms', 'vulcan:accounts']);

	api.mainModule('lib/server/main.js', 'server');
	api.mainModule('lib/client/main.js', 'client');
});
