import Expo from 'expo';
import React, { Component }  from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MapView } from 'expo';
import { Title, Subtitle } from '@shoutem/ui';

import Recommendation from './Recommendation';
import styles from './styles'


const RecommendationsMap = ({
  mapRegion,
  gpsAccuracy,
  recommendations,
  lookingFor,
  headerLocation,
  onRegionChange
}) => (

  <MapView.Animated
    region={mapRegion}
    style={styles.fullscreen}
    onRegionChange={onRegionChange}>

  <Title styleName="h-center multiline" style={styles.mapHeader}>
    {lookingFor ? `${lookingFor} in` : ''} {headerLocation}
  </Title>

  <MapView.Circle center={mapRegion}
                  radius={gpsAccuracy*1.5}
                  strokeWidth={0.5}
                  strokeColor="rgba(66, 180, 230, 1)"
                  fillColor="rgba(66, 180, 230, 0.2)"
                  />

  <MapView.Circle center={mapRegion}
                  radius={5}
                  strokeWidth={0.5}
                  strokeColor="rgba(66, 180, 230, 1)"
                  fillColor="rgba(66, 180, 230, 1)"
                  />

                { recommendations.map(r => <Recommendation {...r} key={r.venue.id} /> )}

  </MapView.Animated>
)

export default RecommendationsMap;
