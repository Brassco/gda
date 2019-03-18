/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from "react";
import { createStackNavigator, createAppContainer } from "react-navigation";
import { View} from "react-native";
import MainScreen from '../Components/MainScreen'
import Equipment from '../Components/Equipment';
import Quotation from '../Components/Quotation';
import Schedule from '../Components/Schedule';

const MainNavigator = createStackNavigator(
  {
    MainScreen: {
      screen: MainScreen,
      navigationOptions: { header: null }
    },
    Equipment: {
      screen: Equipment,
      navigationOptions: { header: null }
    },
    Quotation: {
      screen: Quotation,
      navigationOptions: { header: null }
    },
    Schedule: {
      screen: Schedule,
      navigationOptions: { header: null }
    },
  },
  {
    initialRouteName: "MainScreen"
  }
);

export default MainNavigator;
