import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import ImagePickerExample from "./components/ImagePicker";

export default function App() {
  const [value, setValue] = useState<null | number>(null);

  return (
    <ImagePickerExample />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 42,
  },
});
