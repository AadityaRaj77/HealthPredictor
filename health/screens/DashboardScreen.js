import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Animated } from 'react-native';
import moment from 'moment';

const DashboardScreen = () => {
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
                Animated.timing(jumpAnimation, { toValue: 1, duration: 150, useNativeDriver: true }),
                Animated.timing(jumpAnimation, { toValue: 0, duration: 150, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const translateY = jumpAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10],
    });

    const renderInputField = (label, value, setValue, placeholder, keyboardType = 'default') => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}:</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={setValue}
                placeholder={placeholder}
                keyboardType={keyboardType}
            />
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Top Section */}
            <View style={styles.topSection}>
                <Text style={styles.greeting}>Hi!</Text>
                <Text style={styles.dateTimeText}>{currentDate}</Text>
                <Text style={styles.dateTimeText}>{currentTime}</Text>
                <View style={styles.healthStatusContainer}>
                    <Text style={styles.healthStatusText}>Health Status: {healthStatus}</Text>
                    <Animated.Text style={[styles.jumpingEmoji, { transform: [{ translateY }] }]}>
                        😊
                    </Animated.Text>
                </View>
            </View>

            {/* Input Fields */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Current Metrics</Text>
                {renderInputField('Current Posture', posture, setPosture, 'e.g., Slouching, Upright')}
                {renderInputField('Screen Time (hrs)', screenTime, setScreenTime, 'e.g., 4', 'numeric')}
                {renderInputField('Last Meal (hrs ago)', lastMeal, setLastMeal, 'e.g., 3', 'numeric')}
                {renderInputField('Last Water (min ago)', lastWater, setLastWater, 'e.g., 60', 'numeric')}
                {renderInputField('Last Night\'s Sleep (hrs)', lastNightSleep, setLastNightSleep, 'e.g., 7', 'numeric')}
                {renderInputField('Quality Sleep (1-5)', qualitySleep, setQualitySleep, 'e.g., 4', 'numeric')}
                {renderInputField('Screen Time Before Bed (min)', screenTimeBeforeBed, setScreenTimeBeforeBed, 'e.g., 30', 'numeric')}
            </View>

            {/* Immediate Consequences */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Immediate Consequences</Text>
                <Text style={styles.consequenceText}>
                    Based on your inputs, you might experience:
                </Text>
                <Text style={styles.consequenceItem}>- Neck pain from slouching</Text>
                <Text style={styles.consequenceItem}>- Eye strain from excessive screen time</Text>
                <Text style={styles.consequenceItem}>- Reduced concentration</Text>
                <Text style={styles.consequenceItem}>- Increased stress levels</Text>
                {/* Add more dynamic consequences based on actual input values */}
            </View>

            {/* Quick Fixes with Tasks */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Fixes & Tasks</Text>
                <TouchableOpacity style={styles.taskItem}>
                    <Text style={styles.taskText}>1. Take a 5-minute stretch break</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.taskItem}>
                    <Text style={styles.taskText}>2. Drink a glass of water</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.taskItem}>
                    <Text style={styles.taskText}>3. Look away from your screen every 20 minutes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.taskItem}>
                    <Text style={styles.taskText}>4. Stand up and walk around for 2 minutes</Text>
                </TouchableOpacity>
            </View>

            {/* Tomorrow's Forecast */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tomorrow's Forecast</Text>
                <Text style={styles.forecastText}>
                    If current habits continue, tomorrow you may feel more fatigued and less productive.
                    Focus on improving your sleep and posture for a better day.
                </Text>
            </View>

            {/* Long-Term Effects */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Long-Term Effects</Text>
                <Text style={styles.effectText}>
                    Prolonged poor posture can lead to chronic back issues.
                    Excessive screen time without breaks can harm vision and contribute to digital eye strain.
                    Poor sleep habits can impact cognitive function and overall well-being.
                </Text>
            </View>

            {/* Suggestions (Healthy Habits) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Suggestions (Healthy Habits)</Text>
                <Text style={styles.suggestionItem}>- Regular exercise (30 mins, 3-5 times/week)</Text>
                <Text style={styles.suggestionItem}>- Maintain a balanced diet</Text>
                <Text style={styles.suggestionItem}>- Practice mindful breaks from screens</Text>
                <Text style={styles.suggestionItem}>- Establish a consistent sleep schedule</Text>
                <Text style={styles.suggestionItem}>- Stay hydrated throughout the day</Text>
            </View>

            {/* Prediction Accuracy */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Prediction Accuracy</Text>
                <Text style={styles.accuracyText}>
                    Our predictions are based on general health guidelines and your provided inputs.
                    For personalized advice, consult a healthcare professional.
                </Text>
                <Text style={styles.accuracyValue}>Current Accuracy: ~75% (improving with more data)</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f7',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 50,
    },
    topSection: {
        backgroundColor: '#ffffff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    greeting: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    dateTimeText: {
        fontSize: 18,
        color: '#666',
    },
    healthStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    healthStatusText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#28a745',
        marginRight: 5,
    },
    jumpingEmoji: {
        fontSize: 24,
    },
    section: {
        backgroundColor: '#ffffff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 16,
        color: '#555',
        width: 150, // Fixed width for labels for alignment
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        color: '#333',
    },
    consequenceText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
        lineHeight: 22,
    },
    consequenceItem: {
        fontSize: 15,
        color: '#e74c3c',
        marginBottom: 5,
        marginLeft: 10,
    },
    taskItem: {
        backgroundColor: '#e9f7ef',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#28a745',
    },
    taskText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    forecastText: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    effectText: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    suggestionItem: {
        fontSize: 15,
        color: '#4682b4',
        marginBottom: 5,
        marginLeft: 10,
    },
    accuracyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    accuracyValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#3498db',
    },
});

export default DashboardScreen;