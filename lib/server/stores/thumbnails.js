import gm from 'gm';
import { FileReadHandler } from '../lib';
import { GridFSStore } from 'meteor/jalik:ufs-gridfs';
import Thumbnails from '../../modules/collections/thumbnails';
import Files from '../../modules/collections/files';
import { UploadFS } from 'meteor/jalik:ufs';

/**
 * Thumbnail filter
 * @type {UploadFS.Filter}
 */
export const ThumbnailFilter = new UploadFS.Filter({
	contentTypes: ['image/*']
});

/**
 * The thumbnails store
 * @type {UploadFS.store.Local}
 */

export const ThumbnailStore = new GridFSStore({
	collection: Thumbnails,
	name: 'thumbnails',
	path: './uploads/thumbnails',
	filter: ThumbnailFilter,
	onRead: FileReadHandler,
	permissions: new UploadFS.StorePermissions({}),
	onFinishUpload(file) {
		console.log(`Store.onFinishUpload`, file);
		Files.update({ _id: file.originalId }, { $set: { thumb: file.url } });
	},
	transformWrite(from, to, fileId, file) {
		if (file.type && file.type.startsWith('image/')) {
			if (gm) {
				// Resize image
				gm(from).resize(64, 64).gravity('Center').extent(64, 64).quality(75).autoOrient().stream().pipe(to);
			} else {
				console.error('gm is not installed');
			}
		} else {
			// do nothing
			from.pipe(to);
		}
	}
});
