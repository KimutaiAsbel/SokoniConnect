import { AttendanceRecord } from '../types';
import { getToken } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

export const checkIn = async (marketId: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/attendance/checkin`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ market_id: parseInt(marketId) }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Check-in failed');
        }
    } catch (error) {
        console.error('Check-in error:', error);
        throw error;
    }
};

export const checkOut = async (marketId: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/attendance/checkout`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ market_id: parseInt(marketId) }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Check-out failed');
        }
    } catch (error) {
        console.error('Check-out error:', error);
        throw error;
    }
};

export const getAttendanceRecords = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${API_URL}/attendance`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch attendance records');
        }

        const records = await response.json();
        return records;
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        throw error;
    }
};

export const getTodayAttendance = async (): Promise<any[]> => {
    try {
        const records = await getAttendanceRecords();
        const today = new Date().toISOString().split('T')[0];
        
        return records.filter(record => record.date === today);
    } catch (error) {
        console.error('Error fetching today\'s attendance:', error);
        throw error;
    }
};

export const getAttendanceStats = async () => {
    try {
        const records = await getAttendanceRecords();
        const today = new Date().toISOString().split('T')[0];
        
        const todayRecords = records.filter(record => record.date === today);
        const currentlyCheckedIn = todayRecords.filter(record => !record.check_out_time);
        
        // Calculate total hours for completed records
        const completedRecords = records.filter(record => record.check_out_time);
        const totalHours = completedRecords.reduce((total, record) => {
            const checkIn = new Date(record.check_in_time);
            const checkOut = new Date(record.check_out_time);
            const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
            return total + hours;
        }, 0);
        
        // Calculate average attendance per week
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const weeklyRecords = records.filter(record => new Date(record.date) >= lastWeek);
        
        return {
            totalDays: records.length,
            totalHours: Math.round(totalHours * 100) / 100,
            averageHoursPerDay: records.length > 0 ? Math.round((totalHours / records.length) * 100) / 100 : 0,
            currentlyCheckedIn: currentlyCheckedIn.length,
            thisWeekDays: weeklyRecords.length,
            status: currentlyCheckedIn.length > 0 ? 'checked-in' : 'checked-out'
        };
    } catch (error) {
        console.error('Error fetching attendance stats:', error);
        return {
            totalDays: 0,
            totalHours: 0,
            averageHoursPerDay: 0,
            currentlyCheckedIn: 0,
            thisWeekDays: 0,
            status: 'checked-out'
        };
    }
};

// Legacy function for backward compatibility
export const getAttendanceData = async (userId?: string) => {
    return getAttendanceRecords();
};