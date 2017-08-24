import { Mongo } from 'meteor/mongo';

/**
 * The thumbnails collection
 * @type {Mongo.Collection}
 */

const Thumbnails = new Mongo.Collection('thumbnails');

// Deny all operations on thumbnails from client
Thumbnails.allow({
	insert(userId, file) {
		return false;
	},
	remove(userId, file) {
		return false;
	},
	update(userId, file, fields, mod) {
		return false;
	}
});

export default Thumbnails;
