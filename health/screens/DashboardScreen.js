import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Animated, ActivityIndicator, Platform } from 'react-native';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = ({ navigation }) => {
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [healthStatus, setHealthStatus] = useState('Good');
    const [posture, setPosture] = useState('');
    const [screenTime, setScreenTime] = useState('');
    const [lastMeal, setLastMeal] = useState('');
    const [lastWater, setLastWater] = useState('');
    const [lastNightSleep, setLastNightSleep] = useState('');
    const [qualitySleep, setQualitySleep] = useState('');
    const [screenTimeBeforeBed, setScreenTimeBeforeBed] = useState('');

    const [healthReport, setHealthReport] = useState(null);
    const [loadingTips, setLoadingTips] = useState(false);

    const jumpAnimation = new Animated.Value(0);

    useEffect(() => {
        const updateDateTime = () => {
            setCurrentDate(moment().format('MMMM Do YYYY'));
            setCurrentTime(moment().format('h:mm A'));
        };
        updateDateTime();
        const intervalId = setInterval(updateDateTime, 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(jumpAnimation, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: Platform.OS !== 'web' // Fix for web warning
                }),
                Animated.timing(jumpAnimation, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: Platform.OS !== 'web' // Fix for web warning
                }),
            ])
        ).start();
    }, []);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            navigation.replace('Login');
        } catch (error) {
            console.log('Logout error:', error);
        }
    };

    const getTips = async () => {
        setLoadingTips(true);
        setHealthReport(null); // Clear old report
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch('[http://10.107.38.208:5000/get-tips](http://10.107.38.208:5000/get-tips)', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    posture, screenTime, lastMeal, lastWater, lastNightSleep, qualitySleep, screenTimeBeforeBed
                }),
            });

            console.log('get-tips status:', res.status);
            const rawText = await res.text();
            console.log("===== RAW SERVER RESPONSE START =====");
            console.log(rawText);
            console.log("===== RAW SERVER RESPONSE END =====");
            const data = JSON.parse(rawText);
            console.log('get-tips response:', data);

            if (res.ok && data.success) {
                setHealthReport(data.healthReport || null);
                if (!data.healthReport) {
                    alert('Received an empty report from the server.');
                }
            } else {
                const errMsg = data?.error || data?.message || 'Unknown error from server';
                alert("Server error: " + errMsg);
                console.warn('get-tips failed:', data);
            }
        } catch (err) {
            console.log("Network / client error fetching tips:", err);
            alert("Network error fetching tips. Check console for raw response.");
        } finally {
            setLoadingTips(false);
        }
    };

    const translateY = jumpAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

    const renderInputField = (label, value, setValue, placeholder, keyboardType = 'default') => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}:</Text>
            <TextInput style={styles.input} value={value} onChangeText={setValue} placeholder={placeholder} keyboardType={keyboardType} />
        </View>
    );

    const getAlertColor = (level) => {
        if (!level) return '#555'; // Default
        const lowerLevel = level.toLowerCase();
        if (lowerLevel === 'risk') return '#e63946'; // Red
        if (lowerLevel === 'moderate') return '#f4a261'; // Orange
        if (lowerLevel === 'good') return '#2a9d8f'; // Green
        return '#555';
    };

    const renderAlerts = (alerts) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alerts</Text>
            {Object.keys(alerts).map((key) => (
                <View key={key} style={[styles.alertBox, { borderLeftColor: getAlertColor(alerts[key].level) }]}>
                    <Text style={styles.alertTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}:
                        <Text style={{ color: getAlertColor(alerts[key].level), fontWeight: 'bold' }}> {alerts[key].level}</Text>
                    </Text>
                    <Text style={styles.alertMessage}>{alerts[key].message}</Text>
                </View>
            ))}
        </View>
    );

    const renderListSection = (title, items) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {items.map((item, idx) => (
                <Text key={idx} style={styles.suggestionItem}>- {item}</Text>
            ))}
        </View>
    );

    const renderRisks = (risks) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Near Future Risks</Text>
            <View style={styles.riskContainer}>
                <Text style={styles.riskLabel}>Physical:</Text>
                <Text style={styles.riskText}>{risks.physical}</Text>
            </View>
            <View style={styles.riskContainer}>
                <Text style={styles.riskLabel}>Mental:</Text>
                <Text style={styles.riskText}>{risks.mental}</Text>
            </View>
            <View style={styles.riskContainer}>
                <Text style={styles.riskLabel}>Overall:</Text>
                <Text style={styles.riskText}>{risks.overall}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.topSection}>
                <Text style={styles.greeting}>Hi!</Text>
                <Text style={styles.dateTimeText}>{currentDate}</Text>
                <Text style={styles.dateTimeText}>{currentTime}</Text>
                <View style={styles.healthStatusContainer}>
                    <Text style={styles.healthStatusText}>Health Status: {healthStatus}</Text>
                    <Animated.Text style={[styles.jumpingEmoji, { transform: [{ translateY }] }]}>😊</Animated.Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Current Metrics</Text>
                {renderInputField('Current Posture', posture, setPosture, 'e.g., Slouching, Upright')}
                {renderInputField('Screen Time (hrs)', screenTime, setScreenTime, 'e.g., 4', 'numeric')}
                {renderInputField('Last Meal (hrs ago)', lastMeal, setLastMeal, 'e.g., 3', 'numeric')}
                {renderInputField('Last Water (min ago)', lastWater, setLastWater, 'e.g., 60', 'numeric')}
                {renderInputField('Last Night\'s Sleep (hrs)', lastNightSleep, setLastNightSleep, 'e.g., 7', 'numeric')}
                {renderInputField('Quality Sleep (1-5)', qualitySleep, setQualitySleep, 'e.g., 4', 'numeric')}
                {renderInputField('Screen Time Before Bed (min)', screenTimeBeforeBed, setScreenTimeBeforeBed, 'e.g., 30', 'numeric')}

                <TouchableOpacity style={styles.taskItem} onPress={getTips} disabled={loadingTips}>
                    <Text style={styles.taskText}>{loadingTips ? 'Analyzing...' : 'Get Personalized Tips'}</Text>
                </TouchableOpacity>
            </View>

            {/* --- NEW DYNAMIC CONTENT --- */}
            {loadingTips && <ActivityIndicator size="large" color="#3498db" style={{ marginVertical: 20 }} />}

            {healthReport && !loadingTips && (
                <>
                    {healthReport.alerts && renderAlerts(healthReport.alerts)}
                    {healthReport.quickFixes && renderListSection('Quick Fixes', healthReport.quickFixes)}
                    {healthReport.nearFutureRisks && renderRisks(healthReport.nearFutureRisks)}
                    {healthReport.potentialFutureDiseases && renderListSection('Potential Future Diseases', healthReport.potentialFutureDiseases)}
                    {healthReport.generalizedTips && renderListSection('Generalized Tips', healthReport.generalizedTips)}
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f7' },
    contentContainer: { padding: 20, paddingBottom: 50 },
    topSection: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 20, alignItems: 'center', elevation: 5 },
    greeting: { fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    dateTimeText: { fontSize: 18, color: '#666' },
    healthStatusContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    healthStatusText: { fontSize: 20, fontWeight: '600', color: '#28a745', marginRight: 5 },
    jumpingEmoji: { fontSize: 24 },
    logoutButton: { marginTop: 15, backgroundColor: '#e63946', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 10 },
    logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    section: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 20, elevation: 5 },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    inputGroup: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    inputLabel: { fontSize: 16, color: '#555', width: 150 },
    input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 16, color: '#333' },
    taskItem: { backgroundColor: '#e9f7ef', padding: 12, borderRadius: 10, marginBottom: 10, borderLeftWidth: 5, borderLeftColor: '#28a745' },
    taskText: { fontSize: 16, color: '#333', fontWeight: '500' },
    suggestionItem: { fontSize: 15, color: '#4682b4', marginBottom: 5, marginLeft: 10, lineHeight: 22 },
    alertBox: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderLeftWidth: 5,
        elevation: 2,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 3,
    },
    alertMessage: {
        fontSize: 15,
        color: '#555',
    },
    riskContainer: {
        marginBottom: 10,
    },
    riskLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#34495e',
    },
    riskText: {
        fontSize: 15,
        color: '#555',
        paddingLeft: 10,
    },
});

export default DashboardScreen;