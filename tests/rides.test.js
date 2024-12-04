const request = require('supertest');
const app = require('./testServer');

describe('Rides Endpoints', () => {
  let authToken;

  beforeAll(async () => {
    // Login to get auth token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    authToken = res.body.token;
  });

  it('should create a new ride request', async () => {
    const res = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        pickupLocation: {
          latitude: -1.9440727,
          longitude: 30.0889168
        },
        dropoffLocation: {
          latitude: -1.9557833,
          longitude: 30.0605640
        }
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should get user rides history', async () => {
    const res = await request(app)
      .get('/api/rides/history')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
