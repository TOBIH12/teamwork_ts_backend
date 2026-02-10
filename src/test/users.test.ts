import chai from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import app from '../index';
import pool from '../db';

const { expect } = chai;

describe('User Registration Endpoint', () => {
  let token = '';

  before(async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await pool.query(
      'INSERT into "users" (first_name, last_name, email, password, gender, job_role, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
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
        firstName: 'Jim',
        lastName: 'Sam',
        email: 'samey@gmail.com',
        password: 'password123',
        gender: 'male',
        jobRole: 'employee',
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
    expect(res.body.data).to.have.property('userId');
    expect(res.body.data).to.have.property('jobRole', 'employee');
  });

  // Check for existing email

  it('should fail to register a user with existing email', async () => {
    const res = await request(app)
      .post('/api/v1/users/admin/createUser')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Jim',
        lastName: 'Samuel',
        email: 'dave@gmail.com',
        password: 'password123',
        gender: 'male',
        jobRole: 'employee',
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
      'INSERT into "users" (first_name, last_name, email, password, gender, job_role, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
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
    expect(res.body.data).to.have.property('userId');
    expect(res.body.data).to.have.property('jobRole', 'employee');
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
  });
});

describe('Edit User Details Endpoint', () => {
  let token = '';
  let userId = '';

  before(async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await pool.query(
      'INSERT into "users" (first_name, last_name, email, password, gender, job_role, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
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
    userId = res.body.data.userId || res.body.userId;
  });

  it('should edit user details successfully', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/editUserDetails/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Jim',
        lastName: 'Sam',
        email: 'samey@gmail.com',
        gender: 'male',
        department: 'accounting',
        address: '123 Main St',
      });
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      'User details updated successfully'
    );
    expect(res.body.data).to.have.property('userId', parseInt(userId, 10));
    expect(res.body.data).to.have.property('firstName', 'Jim');
    expect(res.body.data).to.have.property('lastName', 'Sam');
    expect(res.body.data).to.have.property('email', 'samey@gmail.com');
  });

  it('should return error 400 for empty email field/invalid email', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/editUserDetails/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Jim',
        lastName: 'Sam',
        email: '',
        gender: 'male',
        department: 'accounting',
        address: '123 Main St',
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'validation error');
    expect(res.body).to.have.property('error', 'Invalid email address');
  });

  it('should return error 403 for unauthorized edit attempt', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/editUserDetails/${userId + 1}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Jim',
        lastName: 'Sam',
        email: 'samey@gmail.com',
        gender: 'male',
        department: 'accounting',
        address: '123 Main St',
      });
    expect(res.status).to.equal(403);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `Unauthorized to edit another user's details`
    );
  });

  after(async () => {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  });
});

describe('Change User Password Endpoint', () => {
  let token = '';
  let userId = '';

  before(async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await pool.query(
      'INSERT into "users" (first_name, last_name, email, password, gender, job_role, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
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
    userId = res.body.data.userId || res.body.userId;
  });

  it('should change user password successfully', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/auth/changePassword/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'dave@gmail.com',
        currentPassword: 'password123',
        newPassword: 'newPassword123',
        confirmNewPassword: 'newPassword123',
      });
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      'Password updated successfully'
    );
  });

  it('should return error 400 unexisting email', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/auth/changePassword/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'wrongEmail@gmail.com',
        currentPassword: 'newPassword123',
        newPassword: 'password123',
        confirmNewPassword: 'password123',
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      'Email address is not recognized'
    );
  });

  it('should return error 400 for incorrect current password', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/auth/changePassword/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'dave@gmail.com',
        currentPassword: 'wrongPassword123',
        newPassword: 'password123',
        confirmNewPassword: 'password123',
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('error', 'Current password is incorrect');
  });

  it('should return error 400 for new password and confirm new password mismatch', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/auth/changePassword/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'dave@gmail.com',
        currentPassword: 'newPassword123',
        newPassword: 'newerPassword123',
        confirmNewPassword: 'differentPassword123',
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      'New password and confirm new password do not match'
    );
  });

  after(async () => {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  });
});

describe('Upload user image endpoint', () => {
  let token = '';
  let userId = '';

  before(async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await pool.query(
      'INSERT into "users" (first_name, last_name, email, password, gender, job_role, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
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
    userId = res.body.data.userId || res.body.userId;
  });

  it('should upload user image successfully', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/uploadUserImage/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .attach(
        'userImg',
        fs.readFileSync(path.join(__dirname, 'testFiles', 'avatar3.jpg')),
        'avatar3.jpg'
      );
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      'User image updated successfully'
    );
    expect(res.body.data).to.have.property('userImgUrl');
  });

  it('should return error 403 for unauthorized image upload attempt', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/uploadUserImage/${userId + 1}`)
      .set('Authorization', `Bearer ${token}`)
      .attach(
        'userImg',
        fs.readFileSync(path.join(__dirname, 'testFiles', 'avatar3.jpg')),
        'avatar3.jpg'
      );
    expect(res.status).to.equal(403);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `Unauthorized to change another user's image`
    );
  });

  it('should return error 400 if no image file is uploaded', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/uploadUserImage/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('error', 'No image file uploaded');
  });

  after(async () => {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    await pool.end();
  });
});
