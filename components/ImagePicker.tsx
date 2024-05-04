import { useState } from 'react';
import { Button, Image, View, StyleSheet, Text, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { readQR } from '../modules/my-rust-module';
import { QrImage, Rectangle } from './QrImage';

type ImageType = {
    uri: string;
    width: number;
    height: number;
}

export default function ImagePickerExample() {
    const [image, setImage] = useState<ImageType | null>(null);
    const [rectangles, setRectangles] = useState<Rectangle[] | undefined>(undefined)
    const aspectRatio = (image?.height ?? 100) / (image?.width ?? 100)

    const [value, setValue] = useState<null | number>(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage({ uri: result.assets[0].uri, height: result.assets[0].height, width: result.assets[0].width });
            const qrData = await readQR(result.assets[0].uri);
            console.log("moi" + qrData.get("content"));
            setRectangles(coordinateHandler([100, 100, 200, 200, 100, 200, 200, 100, 500, 400, 700, 300, 600, 800, 200, 400]))
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titleText} >QR-scanner</Text>

            {value && <Text>{value.toString()}</Text>}
            {image && <View style={styles.imageContainer}>
                <QrImage uri={image.uri} aspectRatio={aspectRatio} width={Dimensions.get('window').width - 30} originalWidth={image.width} coordinates={rectangles} />
            </View>
            }
            <Button title="Pick an image from camera roll" onPress={pickImage} />
        </View>
    );
}

type Dot = {
    x: number,
    y: number
}

const coordinateHandler = (coordinates: number[]) => {
    const coordinates2 = coordinates
    const arrayofRectangles: Rectangle[] = []
    while (coordinates2.length) {
        const cords = coordinates2.splice(0, 8)
        const dots: Dot[] = []
        while (cords.length) {
            const xAndY = cords.splice(0, 2)
            if (xAndY.length < 2) break
            dots.push({ x: xAndY[0], y: xAndY[1] })
        }
        const top = dots.map(c => c.y).reduce((a, b) => Math.min(a, b))
        const left = dots.map(c => c.x).reduce((a, b) => Math.min(a, b))
        const rectHeight = dots.map(c => c.y).reduce((a, b) => Math.max(a, b)) - top
        const rectWidth = dots.map(c => c.x).reduce((a, b) => Math.max(a, b)) - left
        arrayofRectangles.push({ top, left, height: rectHeight, width: rectWidth })
    }
    return arrayofRectangles
}

const styles = StyleSheet.create({
    container: {
        height: Dimensions.get('window').height,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#a2d2ff'
    },
    imageContainer: {
        height: "75%",
        width: Dimensions.get('window').width,
        backgroundColor: 'black',
        justifyContent: "center",
        alignItems: 'center',
        marginBottom: 20
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
    },

});