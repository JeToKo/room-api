import Reservation from '../types/reservation';

const isValidParams = (roomId: any, startTime: any, endTime: any): { valid: boolean; error?: string } => {
    if (!roomId || !startTime || !endTime) {
        return { valid: false, error: 'Missing required fields: roomId, startTime, endTime' };
    }

    if (typeof roomId !== 'string' || !roomId.trim()) {
        return { valid: false, error: 'Invalid roomId' };
    }

    return { valid: true };
    
};

const isValidReservation = (startTime: Date, endTime: Date, roomId: string, reservations: Reservation[], excludeId?: string): { valid: boolean; error?: string } => {
    const now = new Date();

    if (startTime >= endTime) {
        return { valid: false, error: 'Start time must be before end time' };
    }

    if (startTime < now) {
        return { valid: false, error: 'Cannot make reservations for past times' };
    }

    const overlappingReservation = reservations.find(
        (res) =>
        res.roomId === roomId &&
        res.id !== excludeId &&
        startTime < res.endTime &&
        endTime > res.startTime
    );

    if (overlappingReservation) {
        return { valid: false, error: 'Time slot is not available for this room' };
    }

    return { valid: true };
};

export { isValidParams, isValidReservation };