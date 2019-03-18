import React from "react";
import { createDrawerNavigator, createSwitchNavigator } from "react-navigation";

import AuthorizationNavigator from "./AuthorizationNavigator";
import MainNavigator from "./MainNavigator";
import { DrawerDecaration } from "../components";
import { Layout } from "../constants";

const { width } = Layout.window;

const Drawer = createDrawerNavigator(
  {
    MainNavigator
  },
  {
    contentComponent: DrawerDecaration,
    drawerPosition: "left",
    initialRouteName: "MainNavigator",
    drawerBackgroundColor: "#fff",
    drawerWidth: width,
    header: null
  }
);

const RootNavigator = createSwitchNavigator(
  {
    // AuthorizationNavigator: { screen: AuthorizationNavigator },
    Drawer: { screen: Drawer }
  },
  {
    initialRouteName: "AuthorizationNavigator",
    headerMode: "none"
  }
);

export default RootNavigator;
