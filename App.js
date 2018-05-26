import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Audio, Permissions, FileSystem, MailComposer } from 'expo';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default class App extends React.Component {

  state = {
    buttonEnabled: true
  }

  async play_sound() {
    this.setState({ buttonEnabled: false })

    const { Permissions } = Expo;
    let { status } = await Permissions.getAsync(Permissions.AUDIO_RECORDING);
    console.log(status)
    while (status !== 'granted') {
      status = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    }
    if (status === 'granted') {
      /**
       * Setup global parameters for Audio
       */
      await Audio.setIsEnabledAsync(true)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS
      });



      /*
      Prepare audio play
      */
      const soundObject = await new Audio.Sound();
      await soundObject.loadAsync(require('./assets/sounds/sine1.mp3'))
      if (soundObject != null) {
        await soundObject.setPositionAsync(0);
      }
      // await soundObject.setIsMutedAsync(0.0);
      // await soundObject.setVolumeAsync(1.0);


      /*
      Prepare audio recording
      */
      const recorder = await new Audio.Recording();
      await recorder.prepareToRecordAsync({
        ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 96400,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 96400,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        }
      });

      await sleep(5000);

      await recorder.startAsync();

      await sleep(10);

      await soundObject.playAsync()

      await sleep(300);

      await recorder.stopAndUnloadAsync();

      // Send the file
      const newURI = FileSystem.cacheDirectory + 'randomNameHere.wav'

      await FileSystem.moveAsync({
        from: recorder.getURI(),
        to: FileSystem.cacheDirectory + 'randomNameHere.wav'
      })

      MailComposer.composeAsync({
        recipients: ["oscar.rydh.93@gmail.com", "joel.klint@gmail.com"],
        subject: "Mobile Computing Recording",
        attachments: [newURI]
      })

      this.setState({ buttonEnabled: true })
    }

  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Press the button to start a recording</Text>
        <Button
          title="Record"
          onPress={() => this.play_sound()}
          disabled={!this.state.buttonEnabled}
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
