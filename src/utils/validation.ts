import Reservation from '../types/reservation';

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

export default isValidReservation;