import { useState } from 'react';
import { Button, Image, View, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { rustAdd } from '../modules/my-rust-module';

export default function ImagePickerExample() {
    const [image, setImage] = useState<string | null>(null);
    const [height, setHeight] = useState<number | null>(null);
    const [width, setWidth] = useState<number | null>(null);
    const [value, setValue] = useState<null | number>(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1,

        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setHeight(result.assets[0].height);
            setWidth(result.assets[0].width);
            const qrData = await rustAdd(result.assets[0].height, result.assets[0].width);
            setValue(qrData);
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Pick an image from camera roll" onPress={pickImage} />
            {value && <Text>{value.toString()}</Text>}
            {image && <Image source={{ uri: image }} style={{ height: height ? height / 3 : 200, width: width ? width / 3 : 200 }} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});