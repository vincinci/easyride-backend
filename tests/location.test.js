const request = require('supertest');
const app = require('./testServer');

describe('Location Endpoints', () => {
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

  it('should update driver location', async () => {
    const res = await request(app)
      .post('/api/location/update')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        latitude: -1.9440727,
        longitude: 30.0889168
      });
    expect(res.statusCode).toBe(200);
  });

  it('should get nearby drivers', async () => {
    const res = await request(app)
      .get('/api/location/nearby-drivers')
      .query({
        latitude: -1.9440727,
        longitude: 30.0889168,
        radius: 5000
      });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
