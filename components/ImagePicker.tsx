import React, { useState } from 'react';
import { Button, View, StyleSheet, Text, Modal, Pressable, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { QrImage, Rectangle } from './QrImage';  // Ensure these components are defined and imported
import { readQR } from '../modules/my-rust-module';

interface ImageType {
    uri: string;
    width: number;
    height: number;
}

interface QRCode {
    content: string;
    bounds: Bounds;
}

interface Bounds {
    x_max: number;
    y_max: number;
    x_min: number;
    y_min: number;
}

export default function ImagePickerExample() {
    const [image, setImage] = useState<ImageType | null>(null);
    const [rectangles, setRectangles] = useState<Rectangle[]>([]);
    const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedQrCode, setSelectedQrCode] = useState<QRCode | null>(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1,
        });

        if (!result.canceled && result.assets) {
            setImage({ uri: result.assets[0].uri, height: result.assets[0].height, width: result.assets[0].width });
            try {
                const jsonString = await readQR(result.assets[0].uri);
                const qrCodes: QRCode[] = JSON.parse(jsonString);
                setQrCodes(qrCodes);
                const rectangles = coordinateHandler(qrCodes);
                setRectangles(rectangles);
            } catch (error) {
                console.error("Failed to read or parse QR codes", error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>QR-scanner</Text>
            <Modal
                animationType="fade"
                transparent={true}
                visible={selectedQrCode !== null}
                onRequestClose={() => setSelectedQrCode(null)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Content: {selectedQrCode?.content}</Text>
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setSelectedQrCode(null)}
                        >
                            <Text style={styles.textStyle}>Hide Modal</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {image && (
                <View style={styles.imageContainer}>
                    {qrCodes.map((qrCode, index) => (
                        <QrImage
                            uri={image.uri}
                            width={Dimensions.get('window').width - 30}
                            aspectRatio={image.height / image.width}
                            originalWidth={image.width}
                            coordinates={rectangles}
                            onPress={(index) => {
                                console.log('Rectangle pressed:', index);
                                // Additional logic based on index, such as opening a modal with specific QR code details
                            }}
                        />
                    ))}
                </View>
            )}

            <Button title="Pick an image from camera roll" onPress={pickImage} />
        </View>
    );
}

const coordinateHandler = (qrCodes: QRCode[]): Rectangle[] => {
    return qrCodes.map(qrCode => {
        const { x_max, y_max, x_min, y_min } = qrCode.bounds;
        return {
            top: y_min,
            left: x_min,
            height: y_max - y_min,
            width: x_max - x_min
        };
    });
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#a2d2ff'
    },
    imageContainer: {
        height: "75%",
        width: "100%",
        backgroundColor: 'black',
        justifyContent: "center",
        alignItems: 'center',
        marginBottom: 20
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
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
