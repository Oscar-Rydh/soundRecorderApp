import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Audio, Permissions, FileSystem, MailComposer } from 'expo';


export default class App extends React.Component {

  async play_sound() {
    const { Permissions } = Expo;
    let { status } = await Permissions.getAsync(Permissions.AUDIO_RECORDING);
    console.log(status)
    if (status !== 'granted') {
      status = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    }
    if (status === 'granted') {
      /*
      Prepare audio play
      */
      const soundObject = await new Audio.Sound();
      await soundObject.loadAsync(require('./assets/sounds/sine3.wav'))

      /*
      Prepare audio recording
      */
      const recorder = await new Audio.Recording();
      await Audio.setIsEnabledAsync(true)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX
      });
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

      // Start audio recording after 5 seconds
      setTimeout( () => recorder.startAsync(), 5000);

      // Play the audio sweep in 500 ms
      setTimeout(() => soundObject.playAsync(), 5100)

      // Stop audio recording
      setTimeout(async () => {
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

      }, 6000);
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
