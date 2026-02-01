import express, { Request, Response } from 'express';
import Reservation from '../types/reservation';
import {isValidParams, isValidReservation } from '../utils/validation';

const router = express.Router();

// In-memory database
let reservations: Reservation[] = [];
let nextId = 1;

router.get('/', (req: Request, res: Response) => {
    res.send(200);
});


router.get('/reservation/:roomId', (req: Request, res: Response) => {
    const { roomId } = req.params;
    if (!roomId) {
        res.status(400).json({ error: 'Missing roomId parameter' });
        return;
    }
    const roomReservations = reservations.filter((r) => r.roomId === roomId);
    res.json(
        roomReservations.map((r) => ({
            id: r.id,
            roomId: r.roomId,
            startTime: r.startTime.toISOString(),
            endTime: r.endTime.toISOString(),
        }))
    );
});


router.post('/reservation', (req: Request, res: Response) => {
    const { roomId, startTime, endTime } = req.body || {};

    const validParams = isValidParams(roomId, startTime, endTime);
    if (!validParams.valid) {
        res.status(400).json({ error: validParams.error });
        return;
    }

    let start: Date;
    let end: Date;

    try {
        start = new Date(startTime);
        end = new Date(endTime);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Invalid date');
        }
    } catch {
        res.status(400).json({ error: 'Invalid date format. Use ISO 8601 format' });
        return;
    }

    const validReservation = isValidReservation(start, end, roomId, reservations);
    if (!validReservation.valid) {
        res.status(400).json({ error: validReservation.error });
        return;
    }

    const reservation: Reservation = {
        id: String(nextId++),
        roomId: roomId.trim(),
        startTime: start,
        endTime: end,
    };

    reservations.push(reservation);

    res.status(201).json({
        id: reservation.id,
        roomId: reservation.roomId,
        startTime: reservation.startTime.toISOString(),
        endTime: reservation.endTime.toISOString(),
    });
});


router.delete('/reservation/:id', (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ error: 'Missing reservation ID' });
        return;
    }

    const index = reservations.findIndex((r) => r.id === id);

    if (index === -1) {
        res.status(404).json({ error: 'Reservation not found' });
        return;
    }

    const deletedReservation = reservations.splice(index, 1)[0];

    res.json({
        id: deletedReservation.id,
        roomId: deletedReservation.roomId,
        startTime: deletedReservation.startTime.toISOString(),
        endTime: deletedReservation.endTime.toISOString(),
    });
});


export const clearReservations = (): void => {
    reservations = [];
    nextId = 1;
};

export default router;
