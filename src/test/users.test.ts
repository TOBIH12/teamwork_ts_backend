import chai from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import app from '../index';

const { expect } = chai;

describe('User Registration Endpoint', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/v1/users/admin/createUser').send({
      firstname: 'Jim',
      lastname: 'Sam',
      email: 'dave@gmail.com',
      password: 'password123',
      gender: 'male',
      jobrole: 'employee',
      department: 'engineering',
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
    const res = await request(app).post('/api/v1/users/admin/createUser').send({
      firstname: 'Jim',
      lastname: 'Sam',
      email: 'joe@gmail.com',
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
});

describe('Sign In User Endpoint', () => {
  it('should sign in a user successfully', async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'john@gmail.com',
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
      email: 'jane@gmail.com',
      password: 'wrongpassword',
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('error', 'Invalid email or password');
  });
});
