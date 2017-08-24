import gm from 'gm';
import Files from '../../modules/collections/files';
import { FileReadHandler } from '../lib';
import { GridFSStore } from 'meteor/jalik:ufs-gridfs';
import { ThumbnailStore } from '../stores/thumbnails';
import { UploadFS } from 'meteor/jalik:ufs';

/**
 * File filter
 * @type {UploadFS.Filter}
 */
export const FileFilter = new UploadFS.Filter({
	contentTypes: ['image/*', 'audio/*', 'video/*', 'application/*'],
	maxSize: 1024 * 1000 * 10, // 10MB,
	minSize: 1,
	onCheck(file) {
		// Custom checks
		console.log(`Filter.onCheck`, file);
		return true;
	}
});

/**
 * File store using local file system
 * @type {UploadFS.store.GridFS}
 */

export const FileStore = new GridFSStore({
	collection: Files,
	name: 'files',
	path: './uploads/files',
	filter: FileFilter,
	// Overwrite default permissions
	permissions: new UploadFS.StorePermissions({
		insert(userId, file) {
			// allow anyone to upload a file, but check that uploaded file is attached to the user that uploads the file
			return !file.userId || file.userId === userId;
		},
		remove(userId, file) {
			// allow anyone to remove public files, but only owners to remove their files
			return !file.userId || userId === file.userId;
		},
		update(userId, file) {
			// allow anyone to update public files, but only owners to update their files
			return !file.userId || userId === file.userId;
		}
	}),
	copyTo: [ThumbnailStore],
	onCopyError(err, fileId, file) {
		console.log(`Store.onCopyError`, file);
		console.error(err);
	},
	onFinishUpload(file) {
		console.log(`Store.onFinishUpload`, file);
	},
	onRead(fileId, file, request, response) {
		console.log(`Store.onRead`, file);
		FileReadHandler(fileId, file, request, request);
	},
	onReadError(err, fileId, file) {
		console.log(`Store.onReadError`, file);
		console.error(err);
	},
	onWriteError(err, fileId, file) {
		console.log(`Store.onWriteError`, file);
		console.error(err);
	},
	onValidate(file) {
		console.log(`Store.onValidate`, file);
		// if something is wrong, throw an error
		// throw new Meteor.Error('invalid-file-for-x-reason');
	},
	transformWrite(from, to, fileId, file) {
		// Modifies images only
		if (file.type && file.type.startsWith('image/')) {
			if (gm) {
				gm(from).quality(90).autoOrient().stream().pipe(to);
			} else {
				console.error('gm is not installed');
			}
		} else {
			from.pipe(to);
		}
	}
});
