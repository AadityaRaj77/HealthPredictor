import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import axios from "axios";

const BASE_URL = "http://10.107.38.208:5000"; // <- CHANGE to your PC IPv4

export default function SignupScreen({ navigation }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!username || !password) return Alert.alert("Error", "All fields are required!");
        try {
            setLoading(true);
            const res = await axios.post(`${BASE_URL}/signup`, { username, password }, { timeout: 10000 });
            console.log("signup res:", res.data);
            Alert.alert("Success", "Signup successful!");
            navigation.replace("Login");
        } catch (err) {
            console.error("Signup error:", err.response?.data || err.message);
            Alert.alert("Signup failed", err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>

            <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
            </TouchableOpacity>

            <Text style={styles.linkText}>
                Already have an account?{" "}
                <Text style={styles.link} onPress={() => navigation.replace("Login")}>Login</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 20 },
    title: { fontSize: 28, fontWeight: "bold", color: "#00A86B", marginBottom: 40 },
    input: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 16 },
    button: { backgroundColor: "#00A86B", paddingVertical: 12, width: "100%", alignItems: "center", borderRadius: 10 },
    buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
    linkText: { marginTop: 20, fontSize: 16, color: "#555" },
    link: { color: "#00A86B", fontWeight: "bold" },
});
