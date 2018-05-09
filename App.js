import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Audio, Permissions } from 'expo';
import SoundRecorder from 'react-native-sound-recorder';


export default class App extends React.Component {

  async play_sound() {

    const { Permissions } = Expo;
    let { status } = await Permissions.getAsync(Permissions.AUDIO_RECORDING);
    console.log(status)
    if (status !== 'granted') {
      status = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    }
    if (status === 'granted') {
      //await Audio.setIsEnabledAsync(true)
      const soundObject = new Audio.Sound();
      await Audio.setIsEnabledAsync(true)
      try {
        await soundObject.loadAsync(require('./assets/sounds/test.m4a'));
        console.log("Prepering recording")
        SoundRecorder.start(SoundRecorder.PATH_CACHE + '/test.mp4')
          .then(function () {
            console.log('started recording');
            SoundRecorder.stop()
              .then(function (path) {
                console.log('stopped recording, audio file saved at: ' + path);
              });
          });
        await recording.startAsync();
        const result = await recordingInstance.stopAndUnloadAsync();
        console.log(result)
        // You are now recording!
        await soundObject.playAsync();
        // Your sound is playing!
      } catch (error) {
        // An error occurred!
        console.log(error)
      }
    }

  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Press the button to start a recording</Text>
        <Button
          title="Record"
          onPress={() => this.play_sound()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
