import { Components, getSetting, registerComponent } from 'meteor/vulcan:lib';
import React, { PureComponent } from 'react';
import { UploadFS } from 'meteor/jalik:ufs';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import 'isomorphic-fetch'; // patch for browser which don't have fetch implemented

global.workers = {};

const getImageUrl = imageOrImageArray => {
	const image = Array.isArray(imageOrImageArray) ? imageOrImageArray[0] : imageOrImageArray;
	const imageUrl = typeof image === 'string' ? image : image.secure_url;
	return imageUrl;
};

const removeNthItem = (array, n) => [..._.first(array, n), ..._.rest(array, n + 1)];

class Image extends PureComponent {
	constructor() {
		super();
		this.clearImage = this.clearImage.bind(this);
	}

	clearImage(e) {
		e.preventDefault();
		this.props.clearImage(this.props.index);
	}

	render() {
		return (
			<div>
				<a href="javascript:void(0)" onClick={this.clearImage}>
					<Components.Icon name="close" /> Remove image
				</a>
				<img style={{ height: 120 }} src={getImageUrl(this.props.image)} />
			</div>
		);
	}
}

class Upload extends PureComponent {
	constructor(props, context) {
		super(props);

		this.onDrop = this.onDrop.bind(this);
		this.clearImage = this.clearImage.bind(this);
		this.enableMultiple = this.enableMultiple.bind(this);

		const isEmpty = this.enableMultiple() ? props.value.length === 0 : !props.value;
		const emptyValue = this.enableMultiple() ? [] : '';

		this.state = {
			preview: '',
			uploading: false,
			value: isEmpty ? emptyValue : props.value
		};
	}

	componentWillMount() {
		const isEmpty = this.enableMultiple() ? this.props.value.length === 0 : !this.props.value;
		const emptyValue = this.enableMultiple() ? [] : '';
		this.context.addToAutofilledValues({ [this.props.name]: isEmpty ? emptyValue : this.props.value });
	}

	enableMultiple() {
		return this.props.datatype.definitions[0].type === Array;
	}

	onDrop(files) {
		const file = files[0];

		// set the component in upload mode with the preview
		this.setState({
			preview: this.enableMultiple ? [...this.state.preview, file.preview] : file.preview,
			uploading: true
		});

		const ONE_MB = 1024 * 1000;

		// Prepare file meta data
		const meta = {
			name: file.name,
			type: file.type,
			size: file.size,
			customField: Date.now()
		};

		// Prepare uploader for each file to upload
		const uploader = new UploadFS.Uploader({
			adaptive: true, // use adaptive transfer speed
			chunkSize: ONE_MB, // default chunk size
			maxChunkSize: ONE_MB * 10, // max chunk size when uploading (used only with adaptive transfer)
			data: file, // file blob data
			file: meta, // file meta data
			store: 'files', // where the file will be stored
			maxTries: 3
		});
		uploader.onAbort = function(file) {
			console.info(`${file.name} upload aborted`);
		};
		uploader.onComplete = file => {
			const newValue = file._id;
			// set the uploading status to false
			this.setState({
				uploading: false,
				value: newValue
			});

			// tell vulcanForm to catch the value
			this.context.addToAutofilledValues({ [this.props.name]: newValue });
		};
		uploader.onCreate = function(file) {
			console.info(`${file.name} created`);
			workers[file._id] = this;
		};
		uploader.onError = function(err, file) {
			let message = `${file.name} could not be uploaded : ${err.message}`;
			console.error(message);
			console.error('ERROR:', err);
			console.error(err.stack);
			window.alert(message);
		};
		uploader.onProgress = function(file, progress) {
			console.info(
				file.name +
					' :' +
					'\n' +
					(progress * 100).toFixed(2) +
					'%' +
					'\n' +
					(this.getSpeed() / 1024).toFixed(2) +
					'KB/s' +
					'\n' +
					'elapsed: ' +
					(this.getElapsedTime() / 1000).toFixed(2) +
					's' +
					'\n' +
					'remaining: ' +
					(this.getRemainingTime() / 1000).toFixed(2) +
					's'
			);
		};
		uploader.start();
	}

	clearImage(index) {
		const newValue = this.enableMultiple() ? removeNthItem(this.state.value, index) : '';
		this.context.addToAutofilledValues({ [this.props.name]: newValue });
		this.setState({
			preview: newValue,
			value: newValue
		});
	}

	render() {
		const { uploading, preview, value } = this.state;
		// show the actual uploaded image or the preview
		const imageData = preview || value;
		console.log(this);
		return (
			<div className="form-group row">
				<label className="control-label col-sm-3">
					{this.props.label}
				</label>
				<div className="col-sm-9">
					<div className="upload-field">
						<Dropzone ref="dropzone" multiple={this.enableMultiple()} onDrop={this.onDrop} accept="image/*" className="dropzone-base" activeClassName="dropzone-active" rejectClassName="dropzone-reject">
							<div>Drop an image here, or click to select an image to upload.</div>
						</Dropzone>

						{imageData
							? <div className="upload-state">
									{uploading ? <span>Uploading…</span> : null}
									<div className="images">
										{this.enableMultiple() ? imageData.map((image, index) => <Image clearImage={this.clearImage} key={index} index={index} image={image} />) : <Image clearImage={this.clearImage} image={imageData} />}
									</div>
								</div>
							: null}
					</div>
				</div>
			</div>
		);
	}
}

Upload.propTypes = {
	name: PropTypes.string,
	value: PropTypes.any,
	label: PropTypes.string
};

Upload.contextTypes = {
	addToAutofilledValues: PropTypes.func
};

registerComponent('Upload', Upload);

export default Upload;
