import Constants from 'expo-constants';

export const MAPS = {
  apiKey: Constants.expoConfig?.extra?.googleMapsApiKey ?? process.env.KEY,
  defaultDelta: {
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  },
};
