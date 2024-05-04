import { useState } from 'react';
import { Button, Image, View, StyleSheet, Text } from 'react-native';

export type Rectangle = {
    top: number,
    left: number,
    height: number,
    width: number
}

export const QrImage = (args: { uri: string, width: number, aspectRatio: number, originalWidth: number, coordinates?: Rectangle[] }) => {
    const { uri, width, aspectRatio, originalWidth, coordinates } = args
    console.log(originalWidth, width, aspectRatio)
    const scale = width / originalWidth
    console.log({ scale })

    return (
        <View style={{ height: aspectRatio * width, width, backgroundColor: "white" }}>
            <Image source={{ uri }} style={{ height: "100%", width: "100%" }} />

            {coordinates?.map((rectangle, index) => {
                return <View key={index} style={[styles.rectangle, {
                    top: rectangle.top * scale,
                    height: rectangle.height * scale,
                    left: rectangle.left * scale,
                    width: rectangle.width * scale
                }]}></View>

            }
            )}

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    rectangle: {

        borderColor: 'red',
        borderWidth: 2,
        position: 'absolute',

    },
});