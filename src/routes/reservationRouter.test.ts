import request from 'supertest';
import {clearReservations} from './reservationRouter';
import app from '../app';
import getDate from '../utils/date';

describe('Room Reservation API', () => {
  beforeEach(() => {
    clearReservations();
  });
  describe('GET /reservation/:roomId', () => {
    it('Should return an empty array initially', async () => {
      const res = await request(app).get('/reservation/A101');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('Should return all reservations for a specific room', async () => {
      const startTime = getDate(1);
      const endTime = getDate(2);

      await request(app).post('/reservation').send({
        roomId: 'A101',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      const res = await request(app).get('/reservation/A101');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('roomId');
      expect(res.body[0]).toHaveProperty('startTime');
      expect(res.body[0]).toHaveProperty('endTime');
    });
  });

  describe('POST /reservation', () => {
    it('Should create a reservation successfully', async () => {
      const startTime = getDate(1);
      const endTime = getDate(2);

      const res = await request(app).post('/reservation').send({
        roomId: 'A101',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.roomId).toBe('A101');
      expect(res.body).toHaveProperty('startTime');
      expect(res.body).toHaveProperty('endTime');
      
    });

    it('Should reject missing required fields', async () => {
      const res = await request(app).post('/reservation').send({
        roomId: 'A101',
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('Should reject invalid roomId', async () => {
      const startTime = getDate(1);
      const endTime = getDate(2);

      const res = await request(app).post('/reservation').send({
        roomId: 123,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid roomId');
    });

    it('hould reject empty roomId', async () => {
      const startTime = getDate(1);
      const endTime = getDate(2);

      const res = await request(app).post('/reservation').send({
        roomId: '   ',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid roomId');
    });

    it('Should reject invalid date format', async () => {
      const res = await request(app).post('/reservation').send({
        roomId: 'A101',
        startTime: 'invalid-date',
        endTime: 'also-invalid',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid date format');
    });

    it('Should reject when start time is after end time', async () => {
      const startTime = getDate(2);
      const endTime = getDate(1);

      const res = await request(app).post('/reservation').send({
        roomId: 'A101',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Start time must be before end time');
    });

    it('Should reject when start time equals end time', async () => {
      const startTime = getDate(1);

      const res = await request(app).post('/reservation').send({
        roomId: 'A101',
        startTime: startTime.toISOString(),
        endTime: startTime.toISOString(),
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Start time must be before end time');
    });

    it('Should reject past time reservations', async () => {
      const pastTime = getDate(-1);
      const futureTime = getDate(1);

      const res = await request(app).post('/reservation').send({
        roomId: 'A101',
        startTime: pastTime.toISOString(),
        endTime: futureTime.toISOString(),
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Cannot make reservations for past times');
    });

    it('Should reject overlapping reservations in same room', async () => {
      const startTime = getDate(5);
      const endTime = getDate(6);

      await request(app).post('/reservation').send({
        roomId: 'A202',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      const overlapStart = getDate(5.5);
      const overlapEnd = getDate(6.5);

      const res = await request(app).post('/reservation').send({
        roomId: 'A202',
        startTime: overlapStart.toISOString(),
        endTime: overlapEnd.toISOString(),
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Time slot is not available');
    });

    it('Should allow same time slot in different room', async () => {
      const startTime = getDate(10);
      const endTime = getDate(11);

      await request(app).post('/reservation').send({
        roomId: 'A101',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      const res = await request(app).post('/reservation').send({
        roomId: 'A202',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      expect(res.status).toBe(201);
      expect(res.body.roomId).toBe('A202');
    });

    it('Should trim whitespace from roomId', async () => {
      const startTime = getDate(12);
      const endTime = getDate(13);

      const res = await request(app).post('/reservation').send({
        roomId: '  room-with-spaces  ',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      expect(res.status).toBe(201);
      expect(res.body.roomId).toBe('room-with-spaces');
    });
  });

  describe('DELETE /reservation/:id', () => {
    it('Should delete a reservation successfully', async () => {
      const startTime = getDate(3);
      const endTime = getDate(4);

      const createres = await request(app).post('/reservation').send({
        roomId: 'A303',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      const reservationId = createres.body.id;

      const deleteres = await request(app).delete(`/reservation/${reservationId}`);

      expect(deleteres.status).toBe(200);
      expect(deleteres.body.id).toBe(reservationId);
      expect(deleteres.body.roomId).toBe('A303');
    });

    it('Should return 404 for non-existent reservation', async () => {
      const res = await request(app).delete('/reservation/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Reservation not found');
    });

    it('Should reject missing ID', async () => {
      const res = await request(app).delete('/reservation/');

      expect(res.status).toBe(404);
    });

    it('Should allow re-booking time slot after deletion', async () => {
      const startTime = getDate(7);
      const endTime = getDate(8);

      const createres = await request(app).post('/reservation').send({
        roomId: 'A404',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      const reservationId = createres.body.id;

      await request(app).delete(`/reservation/${reservationId}`);

      const newres = await request(app).post('/reservation').send({
        roomId: 'A404',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      expect(newres.status).toBe(201);
    });
  });
});
