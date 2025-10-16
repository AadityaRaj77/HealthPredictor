// screens/DashboardScreen.js
import React, { useState } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import Slider from "@react-native-community/slider";

export default function DashboardScreen({ route }) {
    const { user } = route.params;

    const [sleepHours, setSleepHours] = useState(7);
    const [screenTime, setScreenTime] = useState(120);
    const [hydration, setHydration] = useState(2); // liters
    const [posture, setPosture] = useState(5); // 1-10 scale
    const [mood, setMood] = useState(5); // 1-10 scale

    const handleSave = () => {
        // Send daily log to backend (later)
        Alert.alert("Saved!", `User: ${user.name}\nSleep: ${sleepHours}h`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hello, {user.name}</Text>

            <Text>Sleep Hours: {sleepHours}</Text>
            <Slider
                minimumValue={0}
                maximumValue={12}
                step={0.5}
                value={sleepHours}
                onValueChange={setSleepHours}
                style={{ width: "80%", marginBottom: 20 }}
            />

            <Text>Screen Time (min): {screenTime}</Text>
            <Slider
                minimumValue={0}
                maximumValue={480}
                step={10}
                value={screenTime}
                onValueChange={setScreenTime}
                style={{ width: "80%", marginBottom: 20 }}
            />

            <Text>Hydration (liters): {hydration}</Text>
            <Slider
                minimumValue={0}
                maximumValue={5}
                step={0.1}
                value={hydration}
                onValueChange={setHydration}
                style={{ width: "80%", marginBottom: 20 }}
            />

            <Text>Posture (1-10): {posture}</Text>
            <Slider
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={posture}
                onValueChange={setPosture}
                style={{ width: "80%", marginBottom: 20 }}
            />

            <Text>Mood (1-10): {mood}</Text>
            <Slider
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={mood}
                onValueChange={setMood}
                style={{ width: "80%", marginBottom: 20 }}
            />

            <Button title="Save Today's Log" onPress={handleSave} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});
