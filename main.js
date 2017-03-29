import Expo from 'expo';
import React from 'react';
import { FOURSQUARE_CLIENT_ID, FOURSQUARE_CLIENT_SECRET } from 'react-native-dotenv';
import { StyleSheet, Text, View } from 'react-native';
import { EvilIcons } from '@expo/vector-icons';
import { Font, AppLoading } from 'expo';
import { Screen, Spinner, Examples } from '@shoutem/ui';

import RecommendationsMap from './RecommendationsMap';
import styles from './styles';


// map is working in this commit but remove foursquare consts and all state variables after fontsAreLoaded

const CLIENT_ID = FOURSQUARE_CLIENT_ID;
const CLIENT_SECRET = FOURSQUARE_CLIENT_SECRET;
const FOURSQUARE_ENDPOINT = 'https://api.foursquare.com/v2/venues/explore';
const API_DEBOUNCE_TIME = 2000;

class App extends React.Component {
  static route = {
    navigationBar: {
      visible: false,
    }
  }
  state = {
    mapRegion: null,
    gpsAccuracy: null,
    fontsAreLoaded: false,
    recommendations: [],
    lookingFor: null,
    headerLocation: null,
    last4sqCall: null
  }
  watchID = null

  async componentWillMount() {
    await Font.loadAsync({
      'Rubik-Black': require('./node_modules/@shoutem/ui/fonts/Rubik-Black.ttf'),
      'Rubik-BlackItalic': require('./node_modules/@shoutem/ui/fonts/Rubik-BlackItalic.ttf'),
      'Rubik-Bold': require('./node_modules/@shoutem/ui/fonts/Rubik-Bold.ttf'),
      'Rubik-BoldItalic': require('./node_modules/@shoutem/ui/fonts/Rubik-BoldItalic.ttf'),
      'Rubik-Italic': require('./node_modules/@shoutem/ui/fonts/Rubik-Italic.ttf'),
      'Rubik-Light': require('./node_modules/@shoutem/ui/fonts/Rubik-Light.ttf'),
      'Rubik-LightItalic': require('./node_modules/@shoutem/ui/fonts/Rubik-LightItalic.ttf'),
      'Rubik-Medium': require('./node_modules/@shoutem/ui/fonts/Rubik-Medium.ttf'),
      'Rubik-MediumItalic': require('./node_modules/@shoutem/ui/fonts/Rubik-MediumItalic.ttf'),
      'Rubik-Regular': require('./node_modules/@shoutem/ui/fonts/Rubik-Regular.ttf'),
      'rubicon-icon-font': require('./node_modules/@shoutem/ui/fonts/rubicon-icon-font.ttf'),
    });

    this.setState({fontsAreLoaded: true});

    this.watchID = Expo.Location.watchPositionAsync({
      enableHighAccuracy: true
    },({ coords }) => {
      let region = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.00922*1.5,
        longitudeDelta: 0.00421*1.5
      }
      this.onRegionChange(region, coords.accuracy);
    });
  }

  componentWillUnmount() {
    this.watchID.remove();
  }

  onRegionChange(region, gpsAccuracy) {
    //this.fetchVenues(region);

    this.setState({
      mapRegion: region,
      gpsAccuracy: gpsAccuracy || this.state.gpsAccuracy
    })
  }

  fetchVenues(region, lookingFor) {
    if (!this.shouldFetchVenues(lookingFor)) return;

    const query = this.venuesQuery(region, lookingFor);

    fetch(`${FOURSQUARE_ENDPOINT}?${query}`)
      .then(fetch.throwErrors)
      .then(res => res.json())
      .then(json => {
        if (json.response.groups) {
          this.setState({
            recommendations: json.response.groups.reduce(
              (all, g) => all.concat(g ? g.items : []), []
            ),
            headerLocation: json.response.headerLocation,
            last4sqCall: new Date()
          });
        }
      })
      .catch(err => console.log(err));
  }

  shouldFetchVenues(lookingFor) {
    return lookingFor != this.state.lookingFor
      || this.state.last4sqCall === null
      || new Date() - this.state.last4sqCall > API_DEBOUNCE_TIME;
  }

  venuesQuery({ latitude, longitude }, lookingFor ) {
    return queryString({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      v: 20170305,
      ll: `${latitude}, ${longitude}`,
      llAcc: this.state.gpsAccuracy,
      section: lookingFor || this.state.lookingFor || 'food', // this param would be replaced with query: 'English' for english speaking for instance
      limit: 10,
      openNow: 1,
      venuePhotos: 1
    });
  }


  render() {
    if (!this.state.fontsAreLoaded) {
      return <AppLoading />;
    }

    const { mapRegion, lookingFor } = this.state;

    if (mapRegion) {
      return (
        <Screen>
          <RecommendationsMap {...this.state} onRegionChange={this.onRegionChange.bind(this)} />
        </Screen>
      );
    }
    else {
      return (
        <Screen style={styles.centered}>
          <Spinner styleName="large" />
        </Screen>
        // <View style={styles.container}>
        //   <EvilIcons name="spinner-3" size={40} />
        // </View>
      );
    }


  }
}

Expo.registerRootComponent(App);
