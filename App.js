import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Camera, Permissions, ImageManipulator } from 'expo';

const Clarifai = require('clarifai');

const clarifai = new Clarifai.App({
  apiKey: 'fc44cfd8711f4d1bb28cd8022c87ac57',
});
process.nextTick = setImmediate;

export default class CameraExample extends React.Component {
  state = {
    hasCameraPermission: null,
    predictions: [],
  };
  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }
  capturePhoto = async () => {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync();
      return photo.uri;
    }
  };
  resize = async photo => {
    let manipulatedImage = await ImageManipulator.manipulate(
      photo,
      [{ resize: { height: 300, width: 300 } }],
      { base64: true }
    );
    return manipulatedImage.base64;
  };
  predict = async image => {
    let predictions = await clarifai.models.predict(
      Clarifai.GENERAL_MODEL,
      image
    );
    return predictions;
  };
  objectDetection = async () => {
    let photo = await this.capturePhoto();
    let resized = await this.resize(photo);
    let predictions = await this.predict(resized);
    this.setState({ predictions: predictions.outputs[0].data.concepts });
  };

  render() {
    console.log('predictions', this.state.predictions);
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera
            ref={ref => {
              this.camera = ref;
            }}
            style={{ flex: 1 }}
            type={this.state.type}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  backgroundColor: 'blue',
                  height: '10%'
                }}
                onPress={this.objectDetection}
              >
                <Text
                  style={{ fontSize: 30, color: 'white', padding: 15 }}
                >
                  {' '}
                  Detect Objects{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}
