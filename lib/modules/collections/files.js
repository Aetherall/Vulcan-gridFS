import { Mongo } from 'meteor/mongo';

import { createCollection, getDefaultResolvers, getDefaultMutations } from 'meteor/vulcan:core';

const schema = {
	_id: {
		type: String,
		optional: true,
		viewableBy: ['guests']
	},
	name: {
		type: String,
		optional: true,
		viewableBy: ['guests']
	},
	type: {
		type: String,
		optional: true,
		viewableBy: ['guests']
	},
	url: {
		type: String,
		optional: true,
		viewableBy: ['guests']
	},
	thumb: {
		type: String,
		optional: true,
		viewableBy: ['guests']
	},
	size: {
		type: Number,
		optional: true,
		viewableBy: ['guests']
	},
	store: {
		type: String,
		optional: true,
		viewableBy: ['guests']
	},
	complete: {
		type: Boolean,
		optional: true,
		viewableBy: ['guests']
	},
	uploading: {
		type: Boolean,
		optional: true,
		viewableBy: ['guests']
	},
	extension: {
		type: String,
		optional: true,
		viewableBy: ['guests']
	},
	progress: {
		type: Number,
		optional: true,
		viewableBy: ['guests']
	},
	userId: {
		type: String,
		optional: true,
		viewableBy: ['guests']
	},
	etag: {
		type: String,
		optional: true,
		viewableBy: ['guests']
	},
	path: {
		type: String,
		optional: true,
		viewableBy: ['guests']
	},
	token: {
		type: Number,
		optional: true,
		viewableBy: ['guests']
	},
	uploadedAt: {
		type: Date,
		optional: true,
		viewableBy: ['guests']
	}
};

const Files = createCollection({
	collectionName: 'Files',

	typeName: 'File',

	schema,

	resolvers: getDefaultResolvers('Files')
});

// Allow only files to be deleted from the client
Files.allow({
	insert(userId, file) {
		return false;
	},
	remove(userId, file) {
		return true;
	},
	update(userId, file, fields, mod) {
		return false;
	}
});

export default Files;
