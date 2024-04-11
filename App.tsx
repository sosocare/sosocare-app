import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/contexts/AuthContext";
import AppNav from "./src/navigation";
import { Provider } from 'react-redux';
import { store } from "./src/redux";

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <StatusBar animated={true} translucent={true} style='dark' />
        <AppNav />
      </AuthProvider>
    </Provider>
  );
}