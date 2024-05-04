import { useState } from 'react';
import { Button, Image, View, StyleSheet, Text, TouchableOpacity } from 'react-native';

export type Rectangle = {
    top: number,
    left: number,
    height: number,
    width: number,
}

export const QrImage = (args: {
    uri: string,
    width: number,
    aspectRatio: number,
    originalWidth: number,
    coordinates?: Rectangle[],
    onPress: (index: number) => void // Updated to accept an index
}) => {
    const { uri, width, aspectRatio, originalWidth, coordinates, onPress } = args;
    const scale = width / originalWidth;

    return (
        <View style={{ height: aspectRatio * width, width, backgroundColor: "white" }}>
            <Image source={{ uri }} style={{ height: "100%", width: "100%" }} />
            {coordinates?.map((rectangle, index) => (
                <View key={index} style={[styles.rectangle, {
                    top: rectangle.top * scale,
                    height: rectangle.height * scale,
                    left: rectangle.left * scale,
                    width: rectangle.width * scale
                }]}>
                    <TouchableOpacity onPress={() => onPress(index)}>
                        <View style={styles.filler}></View>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    rectangle: {
        position: 'absolute',
    },
    filler: {
        width: "100%",
        height: "100%",
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderColor: 'red',
        borderWidth: 3,
        borderRadius: 20,
    }
});