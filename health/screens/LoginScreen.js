import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from 'expo-web-browser';
import axios from "axios";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- Google Auth Configuration ---
    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: "1028852142120-bprrkjr4vkb8su5u1vuj7dll97iq4i9v.apps.googleusercontent.com",
        androidClientId: "1028852142120-q10qvtjapok1j125k398prourk3fln8u.apps.googleusercontent.com",
        webClientId: "1028852142120-bprrkjr4vkb8su5u1vuj7dll97iq4i9v.apps.googleusercontent.com",
        scopes: ["profile", "email"],
    });

    useEffect(() => {
        if (request) {
            console.log("Authentication Request URL:", request.url);
        }
    }, [request]);


    // --- Handle Google Auth Response ---
    useEffect(() => {
        if (response?.type === "success") {
            const { authentication } = response;
            fetchUserInfo(authentication.accessToken);
        } else if (response?.type === 'error') {
            console.error("Authentication Error:", response.error);
            Alert.alert(
                "Authentication Failed",
                "An error occurred during sign-in. Please check the console."
            );
        }
    }, [response]);

    const fetchUserInfo = async (token) => {
        if (!token) return;

        try {
            setLoading(true);

            const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const user = await res.json();
            console.log("✅ Google user info:", user);

            if (!user?.email) {
                Alert.alert(
                    "Google Login Failed",
                    "Email not returned. Check your consent screen & scopes in Google Cloud."
                );
                setLoading(false);
                return;
            }

            const backendURL = "http://192.168.1.4:5000/auth/google";
            const dbRes = await axios.post(
                backendURL, {
                name: user.name,
                email: user.email,
                photo: user.picture,
                googleId: user.id,
            }, { headers: { "Content-Type": "application/json" } }
            );

            console.log("✅ Backend response:", dbRes.data);

            if (dbRes.data.success) {
                navigation.replace("Profile", { user: dbRes.data.user });
            } else {
                Alert.alert("Login Failed", "Could not sign you in. Please try again.");
            }

        } catch (error) {
            console.error("Login process error:", error.response?.data || error.message);
            Alert.alert("Login Failed", "An unexpected error occurred. Please check the console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={{ uri: "https://placehold.co/120x120/00A86B/FFFFFF?text=WP" }} style={styles.logo} />
            <Text style={styles.title}>WellPredict</Text>
            <Text style={styles.subtitle}>Your personal health & wellness tracker</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#00A86B" />
            ) : (
                <TouchableOpacity
                    style={styles.googleButton}
                    disabled={!request}
                    onPress={() => promptAsync()}
                >
                    <Image
                        source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" }}
                        style={styles.googleIcon}
                    />
                    <Text style={styles.googleText}>Sign in with Google</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FDFDFD",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 20,
        marginBottom: 30
    },
    title: {
        fontSize: 36,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#00A86B"
    },
    subtitle: {
        fontSize: 16,
        color: "#555",
        marginBottom: 50,
        textAlign: "center"
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#eee",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: 15
    },
    googleText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333"
    },
});

