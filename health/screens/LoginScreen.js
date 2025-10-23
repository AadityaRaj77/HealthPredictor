import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.0.110:5000";

export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) return Alert.alert("Error", "Please fill all fields!");
        try {
            setLoading(true);
            const res = await axios.post(`${BASE_URL}/login`, { username, password }, { timeout: 10000 });
            console.log("login res:", res.data);

            await AsyncStorage.setItem("token", res.data.token);
            Alert.alert("Login Success", `Welcome ${res.data.username}`);
            navigation.replace("Dashboard");
        }
        catch (err) {
            console.error("Login error:", err.response?.data || err.message);
            Alert.alert("Login Failed", err.response?.data?.message || "Something went wrong");
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>

            <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>

            <Text style={styles.linkText}>
                Don't have an account?{" "}
                <Text style={styles.link} onPress={() => navigation.replace("Signup")}>Sign Up</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 20 },
    title: { fontSize: 30, fontWeight: "bold", color: "#00A86B", marginBottom: 40 },
    input: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 16 },
    button: { backgroundColor: "#00A86B", paddingVertical: 12, width: "100%", alignItems: "center", borderRadius: 10 },
    buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
    linkText: { marginTop: 20, fontSize: 16, color: "#555" },
    link: { color: "#00A86B", fontWeight: "bold" },
});
