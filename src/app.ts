import express, { Request, Response } from 'express';

const app = express();

app.use(express.json());
const port = process.env.PORT || 3000;

app.use(express.json());

// Types
interface Reservation {
  id: string;
  roomId: string;
  startTime: Date;
  endTime: Date;
}
var jsonParser = express.json();
// In-memory storage
let reservations: Reservation[] = [];
let nextId = 1;

// Utility functions
const isValidReservation = (startTime: Date, endTime: Date, roomId: string, excludeId?: string): { valid: boolean; error?: string } => {
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

// Endpoints
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// GET /reservations - Get all reservations
app.get('/reservations', (req: Request, res: Response) => {
  const response = reservations.map((res) => ({
    id: res.id,
    roomId: res.roomId,
    startTime: res.startTime.toISOString(),
    endTime: res.endTime.toISOString(),
  }));
  res.json(response);
});

// POST /reservation - Create a new reservation
app.post('/reservation', (req: Request, res: Response) => {
  const { roomId, startTime, endTime } = req.body || {};

  // Test-only debug logging to help diagnose failing tests
  if (process.env.NODE_ENV === 'test') {
    // eslint-disable-next-line no-console
    console.log('POST /reservation body:', { roomId, startTime, endTime });
  }

  // Input validation
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

  const validation = isValidReservation(start, end, roomId);
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

// DELETE /reservation - Delete a reservation by ID
app.delete('/reservation/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: 'Missing reservation ID' });
    return;
  }

  const index = reservations.findIndex((res) => res.id === id);

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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Test helper: clears in-memory reservations and resets id counter
export const clearReservations = (): void => {
  reservations = [];
  nextId = 1;
};

export default app;