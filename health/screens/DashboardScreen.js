import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
export default function DashboardScreen({ navigation }) {
    const [sleepHours, setSleepHours] = useState(6);
    const [screenTime, setScreenTime] = useState(120);

    const handlePredict = () => {
        alert(`Sleep: ${sleepHours}h, Screen: ${screenTime}min`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dashboard</Text>

            <Text>Sleep Hours: {sleepHours}</Text>
            <Slider
                minimumValue={0}
                maximumValue={12}
                step={0.5}
                value={sleepHours}
                onValueChange={setSleepHours}
                style={{ width: '80%', marginBottom: 20 }}
            />

            <Text>Screen Time (min): {screenTime}</Text>
            <Slider
                minimumValue={0}
                maximumValue={480}
                step={10}
                value={screenTime}
                onValueChange={setScreenTime}
                style={{ width: '80%', marginBottom: 20 }}
            />

            <Button title="Predict" onPress={handlePredict} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
