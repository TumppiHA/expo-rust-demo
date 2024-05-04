import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { hello, rustAdd } from "./modules/my-rust-module";
import { useEffect, useState } from "react";
import ImagePickerExample from "./components/ImagePicker";

export default function App() {
  const [value, setValue] = useState<null | number>(null);
  useEffect(() => {
    async function doFetch() {
      const result = await rustAdd(40, 12);
      setValue(result);
    }
    doFetch();
  }, []);
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
