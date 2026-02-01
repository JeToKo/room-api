import request from 'supertest';
import app from './app';


describe('Get /', () => {
  it('Should return 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });
});
