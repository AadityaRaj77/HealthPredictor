import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function LoginScreen({ navigation }) {
    const handleLogin = () => {
        // Dummy login: directly navigate to Dashboard
        navigation.replace('Dashboard'); // replace prevents going back to login
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>App</Text>
            <Button title="Login (Dummy)" onPress={handleLogin} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
});
