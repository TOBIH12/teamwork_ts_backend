import chai from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../index';
import pool from '../db';

const { expect } = chai;

describe('User Registration Endpoint', () => {
  let token = '';

  before(async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await pool.query(
      'INSERT into "users" (firstName, lastName, email, password, gender, jobrole, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        'Dave',
        'Ogunleye',
        'dave@gmail.com',
        hashedPassword,
        'male',
        'admin',
        'accounting',
        '123 Main St',
      ]
    );

    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'dave@gmail.com',
      password: 'password123',
    });
    token = res.body.data.token || res.body.token;
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/users/admin/createUser')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'Jim',
        lastname: 'Sam',
        email: 'samey@gmail.com',
        password: 'password123',
        gender: 'male',
        jobrole: 'employee',
        department: 'accounting',
        address: '123 Main St',
      });
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      'User Jim Sam created successfully'
    );
    expect(res.body.data).to.have.property('id');
    expect(res.body.data).to.have.property('jobrole', 'employee');
  });

  // Check for existing email

  it('should fail to register a user with existing email', async () => {
    const res = await request(app)
      .post('/api/v1/users/admin/createUser')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstname: 'Jim',
        lastname: 'Samuel',
        email: 'dave@gmail.com',
        password: 'password123',
        gender: 'male',
        jobrole: 'employee',
        department: 'engineering',
        address: '123 Main St',
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('error', 'Email already exists');
  });

  after(async () => {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  });
});

describe('Sign In User Endpoint', () => {
  before(async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await pool.query(
      'INSERT into "users" (firstName, lastName, email, password, gender, jobrole, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        'Dave',
        'Ogunleye',
        'davey@gmail.com',
        hashedPassword,
        'male',
        'employee',
        'accounting',
        '123 Main St',
      ]
    );
  });

  it('should sign in a user successfully', async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'davey@gmail.com',
      password: 'password123',
    });
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('token');
    expect(res.body.data).to.have.property('id');
    expect(res.body.data).to.have.property('jobrole', 'employee');
  });

  // Check for incorrect email or password
  it('should fail to sign in with incorrect email', async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'jan@email.com',
      password: 'password123',
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('error', 'Invalid email or password');
  });

  it('should fail to sign in with incorrect password', async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'davey@gmail.com',
      password: 'wrongpassword',
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('error', 'Invalid email or password');
  });

  after(async () => {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    await pool.end();
  });
});
