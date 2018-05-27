import React from 'react';
import { StyleSheet, Text, View, Button, AsyncStorage } from 'react-native';
import { Audio, Permissions, FileSystem, MailComposer } from 'expo';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default class App extends React.Component {

  state = {
    buttonEnabled: true,
    result: '-'
  }


  async uploadAudioAsync(uri) {
    console.log("Uploading " + uri);
    let apiUrl = 'http://143.248.214.35:3000/estimation';
    let uriParts = uri.split('.');
    let fileType = uriParts[uriParts.length - 1];
  
    let formData = new FormData();
    formData.append('file', {
      uri,
      name: `recording.${fileType}`,
      type: `audio/x-${fileType}`,
    });
  
    let options = {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    };
  
    return fetch(apiUrl, options);
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

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS
      });


      // Send the file
      
      const newURI = FileSystem.documentDirectory + 'randomNameHere.wav'
      /*
      await FileSystem.moveAsync({
        from: recorder.getURI(),
        to: newURI
      })
      */
      let uri = await recorder.getURI();
      await this.uploadAudioAsync(uri)
        .then(result => result.json())
        .then(result => this.setState({result: result.result}))
        .catch(err => console.log(err))
    

//      await this.sendSound(recorder);


/*
      MailComposer.composeAsync({
        recipients: ["oscar.rydh.93@gmail.com", "joel.klint@gmail.com"],
        subject: "Mobile Computing Recording",
        attachments: [newURI]
      })
*/      

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
        <Text> Result: {this.state.result} </Text>
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
