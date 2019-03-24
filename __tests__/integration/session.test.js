const request = require('supertest');
const nodemailer = require('nodemailer');

const app = require('../../src/app');
const truncate = require('../utils/truncate');
const factory = require('../factories');

jest.mock('nodemailer');

const transport = {
  sendMail: jest.fn(),
};

describe('Authentication', () => {
  beforeEach(async () => {
    await truncate();
  });

  beforeAll(() => {
    nodemailer.createTransport.mockReturnValue(transport);
  });

  it('should be able to authenticate with valid credentials', async () => {
    /**
     * Create a new user
     * Send the login request with valid data
     * Listen the response
     * Expect it to be sucessfull
     */
    const user = await factory.create('User', {
      password: 'rightPass',
    });

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: 'rightPass',
      });

    expect(response.status).toBe(200);
  });

  it('should not be able to auth with invalid credentials', async () => {
    /**
     * Create a new user
     * Send the login request with invalid data
     * Listen the response
     * Expect it to be rejected
     */
    const user = await factory.create('User', {
      password: 'rightPass',
    });

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: 'wrongPass',
      });

    expect(response.status).toBe(401);
  });

  it('should return jwt token when auth', async () => {
    /**
     * Create a new user
     * Send the login request with valid data
     * Listen the response
     * Expect it to have a token in its body
     */
    const user = await factory.create('User', {
      password: 'rightPass',
    });

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: 'rightPass',
      });

    expect(response.body).toHaveProperty('token');
  });

  it('should be able to access private routes when auth', async () => {
    /**
     * Create a new user
     * Send the login request with valid data
     * Listen the response
     * Add a JWT token to the header
     * Expect it to be successfull
     */
    const user = await factory.create('User');

    const response = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
  });

  it('should be not able to access private routes when not auth', async () => {
    /**
     * Send the login request with invalid data
     * Listen the response
     * Do not add a JWT token to the header
     * Expect it to be rejected
     */
    const response = await request(app).get('/dashboard');

    expect(response.status).toBe(401);
  });

  it('should be not able to access private routes when not auth using invalid token', async () => {
    /**
     * Send the login request with invalid data
     * Listen the response
     * Add a invalid JWT token to the header
     * Expect it to be rejected
     */
    const response = await request(app)
      .get('/dashboard')
      .set('Authorization', 'Bearer 123123');

    expect(response.status).toBe(401);
  });

  it('should receive email notification when auth', async () => {
    /**
     * Create a new user
     * Send the login request with valid data
     * Listen the response
     * Expect it to be call the sendmail function
     */
    const user = await factory.create('User', {
      password: 'rightPass',
    });

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: 'rightPass',
      });

    expect(transport.sendMail).toHaveBeenCalledTimes(1);
    expect(transport.sendMail.mock.calls[0][0].to).toBe(
      `${user.name} ${user.email}`
    );
  });
});
