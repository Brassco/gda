import React from "react";
import { createStackNavigator } from "react-navigation";

import { Login, Register, ResetPass } from "../AuthScreens";

const AuthorizationNavigator = createStackNavigator(
  {
    LoginPage: {
      screen: Login,
      navigationOptions: { header: null }
    },
    RegisterPage: {
      screen: Register,
      navigationOptions: { header: null }
    },
    ResetPassPage: {
      screen: ResetPass,
      navigationOptions: { header: null }
    }
  },
  {
    initialRouteName: "LoginPage"
  }
);
export default AuthorizationNavigator;
