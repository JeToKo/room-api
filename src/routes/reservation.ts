import express, { Request, Response } from 'express';
import Reservation from '../types/reservation';
import isValidReservation from '../utils/validation';

const router = express.Router();

// In-memory storage
let reservations: Reservation[] = [];
let nextId = 1;

// Root
router.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// GET /reservations - Get all reservations
router.get('/reservations', (req: Request, res: Response) => {
  const response = reservations.map((r) => ({
    id: r.id,
    roomId: r.roomId,
    startTime: r.startTime.toISOString(),
    endTime: r.endTime.toISOString(),
  }));
  res.json(response);
});

// POST /reservation - Create a new reservation
router.post('/reservation', (req: Request, res: Response) => {
  const { roomId, startTime, endTime } = req.body || {};

  // Test-only debug logging to help diagnose failing tests
  if (process.env.NODE_ENV === 'test') {
    // eslint-disable-next-line no-console
    console.log('POST /reservation body:', { roomId, startTime, endTime });
  }

  if (!roomId || !startTime || !endTime) {
    res.status(400).json({ error: 'Missing required fields: roomId, startTime, endTime' });
    return;
  }

  if (typeof roomId !== 'string' || !roomId.trim()) {
    res.status(400).json({ error: 'Invalid roomId' });
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

  const validation = isValidReservation(start, end, roomId, reservations);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
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

// Test helper: clears in-memory reservations and resets id counter
export const clearReservations = (): void => {
  reservations = [];
  nextId = 1;
};

export default router;
