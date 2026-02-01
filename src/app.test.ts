import request from 'supertest';
import app from './app';
import { clearReservations } from './routes/reservation';

describe('Room Reservation API', () => {
  beforeEach(() => {
    clearReservations();
  });
  // Helper function to get a future date
  const getFutureDate = (hoursFromNow: number): Date => {
    const date = new Date();
    date.setHours(date.getHours() + hoursFromNow);
    return date;
  };

  describe('GET /', () => {
    it('should return Hello World', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello World!');
    });
  });

  describe('GET /reservations', () => {
    it('should return an empty array initially', async () => {
      const response = await request(app).get('/reservations');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all reservations', async () => {
      // Create a reservation first
      const startTime = getFutureDate(1);
      const endTime = getFutureDate(2);

      await request(app).post('/reservation').send({
        roomId: 'room1',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      const response = await request(app).get('/reservations');
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('roomId');
      expect(response.body[0]).toHaveProperty('startTime');
      expect(response.body[0]).toHaveProperty('endTime');
    });
  });

  describe('POST /reservation', () => {
    it('should create a reservation successfully', async () => {
      const startTime = getFutureDate(1);
      const endTime = getFutureDate(2);

      const response = await request(app).post('/reservation').send({
        roomId: 'room1',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.roomId).toBe('room1');
      expect(response.body).toHaveProperty('startTime');
      expect(response.body).toHaveProperty('endTime');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app).post('/reservation').send({
        roomId: 'room1',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should reject invalid roomId', async () => {
      const startTime = getFutureDate(1);
      const endTime = getFutureDate(2);

      const response = await request(app).post('/reservation').send({
        roomId: 123,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid roomId');
    });

    it('should reject empty roomId', async () => {
      const startTime = getFutureDate(1);
      const endTime = getFutureDate(2);

      const response = await request(app).post('/reservation').send({
        roomId: '   ',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid roomId');
    });

    it('should reject invalid date format', async () => {
      const response = await request(app).post('/reservation').send({
        roomId: 'room1',
        startTime: 'invalid-date',
        endTime: 'also-invalid',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid date format');
    });

    it('should reject when start time is after end time', async () => {
      const startTime = getFutureDate(2);
      const endTime = getFutureDate(1);

      const response = await request(app).post('/reservation').send({
        roomId: 'room1',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Start time must be before end time');
    });

    it('should reject when start time equals end time', async () => {
      const startTime = getFutureDate(1);

      const response = await request(app).post('/reservation').send({
        roomId: 'room1',
        startTime: startTime.toISOString(),
        endTime: startTime.toISOString(),
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Start time must be before end time');
    });

    it('should reject past time reservations', async () => {
      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 1);
      const futureTime = getFutureDate(1);

      const response = await request(app).post('/reservation').send({
        roomId: 'room1',
        startTime: pastTime.toISOString(),
        endTime: futureTime.toISOString(),
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Cannot make reservations for past times');
    });

    it('should reject overlapping reservations in same room', async () => {
      const startTime = getFutureDate(5);
      const endTime = getFutureDate(6);

      // Create first reservation
      await request(app).post('/reservation').send({
        roomId: 'room2',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      // Try to create overlapping reservation
      const overlapStart = getFutureDate(5.5);
      const overlapEnd = getFutureDate(6.5);

      const response = await request(app).post('/reservation').send({
        roomId: 'room2',
        startTime: overlapStart.toISOString(),
        endTime: overlapEnd.toISOString(),
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Time slot is not available');
    });

    it('should allow same time slot in different room', async () => {
      const startTime = getFutureDate(10);
      const endTime = getFutureDate(11);

      // Create reservation in room1
      await request(app).post('/reservation').send({
        roomId: 'room1',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      // Create same time slot in room2 - should succeed
      const response = await request(app).post('/reservation').send({
        roomId: 'room2',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      expect(response.status).toBe(201);
      expect(response.body.roomId).toBe('room2');
    });

    it('should trim whitespace from roomId', async () => {
      const startTime = getFutureDate(12);
      const endTime = getFutureDate(13);

      const response = await request(app).post('/reservation').send({
        roomId: '  room-with-spaces  ',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      expect(response.status).toBe(201);
      expect(response.body.roomId).toBe('room-with-spaces');
    });
  });

  describe('DELETE /reservation/:id', () => {
    it('should delete a reservation successfully', async () => {
      // Create a reservation
      const startTime = getFutureDate(3);
      const endTime = getFutureDate(4);

      const createResponse = await request(app).post('/reservation').send({
        roomId: 'room3',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      const reservationId = createResponse.body.id;

      // Delete the reservation
      const deleteResponse = await request(app).delete(`/reservation/${reservationId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.id).toBe(reservationId);
      expect(deleteResponse.body.roomId).toBe('room3');
    });

    it('should return 404 for non-existent reservation', async () => {
      const response = await request(app).delete('/reservation/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Reservation not found');
    });

    it('should reject missing ID', async () => {
      const response = await request(app).delete('/reservation/');

      expect(response.status).toBe(404); // Route not found
    });

    it('should allow re-booking time slot after deletion', async () => {
      const startTime = getFutureDate(7);
      const endTime = getFutureDate(8);

      // Create first reservation
      const createResponse = await request(app).post('/reservation').send({
        roomId: 'room4',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      const reservationId = createResponse.body.id;

      // Delete it
      await request(app).delete(`/reservation/${reservationId}`);

      // Try to create same reservation - should succeed
      const newResponse = await request(app).post('/reservation').send({
        roomId: 'room4',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      expect(newResponse.status).toBe(201);
    });
  });
});
