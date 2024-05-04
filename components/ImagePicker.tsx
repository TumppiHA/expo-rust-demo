import { useState } from 'react';
import { Button, Image, View, StyleSheet, Text, Dimensions, Modal, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { readQR } from '../modules/my-rust-module';
import { QrImage, Rectangle } from './QrImage';

type ImageType = {
    uri: string;
    width: number;
    height: number;
}

type QRData = {
    data: string;
    coordinates?: string;
}

export default function ImagePickerExample() {
    const [image, setImage] = useState<ImageType | null>(null);
    const [rectangles, setRectangles] = useState<Rectangle[] | undefined>(undefined)
    const [qrData, setQrData] = useState<QRData | null>(null)
    const aspectRatio = (image?.height ?? 100) / (image?.width ?? 100)

    const [showData, setShowData] = useState<boolean>(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage({ uri: result.assets[0].uri, height: result.assets[0].height, width: result.assets[0].width });
            const qrDataString = await readQR(result.assets[0].uri.slice(5)); //"https://wikibedia.fi\n500,400,700,300,600,800,200,400"
            const dataAr = qrDataString.split('\n')
            setQrData({ data: dataAr[0], coordinates: dataAr[1] })
            setRectangles(coordinateHandler(dataAr[1]))
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titleText} >QR-scanner</Text>
            <Modal
                animationType="fade"
                transparent={true}
                visible={showData}
                onRequestClose={() => {
                    setShowData(!showData);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>{qrData?.data}</Text>
                        <Text style={styles.modalText}>Coordinates: {qrData?.coordinates?.toString()}</Text>
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setShowData(!showData)}>
                            <Text style={styles.textStyle}>Hide Modal</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {qrData && <Text>{qrData.data}</Text>}
            {image && <View style={styles.imageContainer}>
                <QrImage
                    uri={image.uri}
                    aspectRatio={aspectRatio}
                    width={Dimensions.get('window').width - 30}
                    originalWidth={image.width}
                    coordinates={rectangles}
                    onPress={() => setShowData(true)} />
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

const coordinateHandler = (coordinates: string) => {
    const arrayofRectangles: Rectangle[] = []
    if (!coordinates) return arrayofRectangles
    const numbers = coordinates.split(',');

    const dots: Dot[] = [];

    for (let i = 0; i < numbers.length - 1; i += 2) {
        const x = parseInt(numbers[i], 10);
        const y = parseInt(numbers[i + 1], 10);
        dots.push({ x, y });
    }
    console.log(dots)

    const top = dots.map(c => c.y).reduce((a, b) => Math.min(a, b))
    const left = dots.map(c => c.x).reduce((a, b) => Math.min(a, b))
    const rectHeight = dots.map(c => c.y).reduce((a, b) => Math.max(a, b)) - top
    const rectWidth = dots.map(c => c.x).reduce((a, b) => Math.max(a, b)) - left
    arrayofRectangles.push({ top, left, height: rectHeight, width: rectWidth })

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
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },

});