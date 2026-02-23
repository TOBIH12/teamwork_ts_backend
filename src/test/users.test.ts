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

describe('Get Users Endpoint', () => {
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

    await pool.query(
      'INSERT into "users" (first_name, last_name, email, password, gender, job_role, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        'Samuel',
        'Ogunleye',
        'samuel@gmail.com',
        hashedPassword,
        'male',
        'employee',
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

  it('should get all users successfully', async () => {
    const res = await request(app)
      .get('/api/v1/users/getUsers')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      'Users fetched successfully'
    );
    expect(res.body.data).to.have.property('usersCount', 2);
    expect(res.body.data.users).to.be.an('array');
    expect(res.body.data.users[0]).to.have.property('email', 'dave@gmail.com');
    expect(res.body.data.users[1]).to.have.property(
      'email',
      'samuel@gmail.com'
    );
  });

  it('should return error 401 for unauthorized access', async () => {
    const res = await request(app).get('/api/v1/users/getUsers');
    expect(res.status).to.equal(401);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `Authorization token is missing`
    );
  });

  after(async () => {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  });
});

describe('Get User By Id Endpoint', () => {
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

  it('should get user by id successfully', async () => {
    const res = await request(app)
      .get(`/api/v1/users/getUserById/${userId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      'User fetched successfully'
    );
    expect(res.body.data).to.have.property('email', 'dave@gmail.com');
  });

  it('should return error 401 for unauthorized access', async () => {
    const res = await request(app).get(`/api/v1/users/getUserById/${userId}`);
    expect(res.status).to.equal(401);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `Authorization token is missing`
    );
  });

  it('should return error 404 for non existing user id', async () => {
    const res = await request(app)
      .get(`/api/v1/users/getUserById/9999`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('error', 'User not found');
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
      .patch(`/api/v1/users/editUserDetails`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Jim',
        lastName: 'Sam',
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
  });

  it('should update sucessfully with misssing fields', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/editUserDetails`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Jimmy',
        lastName: 'Samuel',
        gender: '',
        department: '',
        address: '',
      });
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      'User details updated successfully'
    );
    expect(res.body.data).to.have.property('userId', parseInt(userId, 10));
    expect(res.body.data).to.have.property('firstName', 'Jimmy');
    expect(res.body.data).to.have.property('gender', 'male');
  });

  it('should return error 401 for unauthorized edit attempt', async () => {
    const res = await request(app).patch(`/api/v1/users/editUserDetails`).send({
      firstName: 'Jim',
      lastName: 'Sam',
      gender: 'male',
      department: 'accounting',
      address: '123 Main St',
    });
    expect(res.status).to.equal(401);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `Authorization token is missing`
    );
  });

  after(async () => {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  });
});

describe('Change User Password Endpoint', () => {
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

  it('should change user password successfully', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/auth/changePassword`)
      .set('Authorization', `Bearer ${token}`)
      .send({
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

  it('should return error 400 for incorrect current password', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/auth/changePassword`)
      .set('Authorization', `Bearer ${token}`)
      .send({
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
      .patch(`/api/v1/users/auth/changePassword`)
      .set('Authorization', `Bearer ${token}`)
      .send({
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

  it('should upload user image successfully', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/uploadUserImage`)
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
      .patch(`/api/v1/users/uploadUserImage`)
      .attach(
        'userImg',
        fs.readFileSync(path.join(__dirname, 'testFiles', 'avatar3.jpg')),
        'avatar3.jpg'
      );
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `Authorization token is missing`
    );
  });

  it('should return error 400 if no image file is uploaded', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/uploadUserImage`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('error', 'No image file uploaded');
  });

  after(async () => {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  });
});

describe('Update User Role Endpoint', () => {
  let token = '';
  let reqUserId = '';
  let resUserId1 = '';
  let resUserId2 = '';

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

    const resUser1 = await pool.query(
      'INSERT into "users" (first_name, last_name, email, password, gender, job_role, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        'Samuel',
        'Ogunleye',
        'samuel@gmail.com',
        hashedPassword,
        'male',
        'employee',
        'accounting',
        '123 Main St',
      ]
    );

    resUserId1 = resUser1.rows[0].user_id;

    const resUser2 = await pool.query(
      'INSERT into "users" (first_name, last_name, email, password, gender, job_role, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        'Elizabeth',
        'Ogunleye',
        'elizabeth@gmail.com',
        hashedPassword,
        'female',
        'admin',
        'accounting',
        '123 Main St',
      ]
    );

    resUserId2 = resUser2.rows[0].user_id;

    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'dave@gmail.com',
      password: 'password123',
    });
    token = res.body.data.token || res.body.token;
    reqUserId = res.body.data.userId || res.body.userId;
  });

  it('should update user role to admin successfully', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/admin/updateRole/${resUserId1}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      `Samuel Ogunleye has been promoted to admin`
    );
  });

  it('should update user role to employee successfully', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/admin/updateRole/${resUserId2}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      `Elizabeth Ogunleye's role has been updated to employee`
    );
  });

  it('should return error 401 for unauthorized role update attempt', async () => {
    const res = await request(app).patch(
      `/api/v1/users/admin/updateRole/${resUserId1}`
    );
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `Authorization token is missing`
    );
  });

  after(async () => {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  });
});

describe('Delete User Endpoint', () => {
  let token = '';
  let reqUserId = '';
  let resUserId = '';

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

    const resUser = await pool.query(
      'INSERT into "users" (first_name, last_name, email, password, gender, job_role, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        'Samuel',
        'Ogunleye',
        'samuel@gmail.com',
        hashedPassword,
        'male',
        'employee',
        'accounting',
        '123 Main St',
      ]
    );

    resUserId = resUser.rows[0].user_id;

    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'dave@gmail.com',
      password: 'password123',
    });
    token = res.body.data.token || res.body.token;
    reqUserId = res.body.data.userId || res.body.userId;
  });

  it('should delete user successfully', async () => {
    const res = await request(app)
      .delete(`/api/v1/users/admin/deleteUser/${resUserId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      `Successfully deleted Samuel Ogunleye`
    );
  });

  it('should return error 401 for unauthorized delete attempt', async () => {
    const res = await request(app).delete(
      `/api/v1/users/admin/deleteUser/${resUserId}`
    );
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `Authorization token is missing`
    );
  });

  after(async () => {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    await pool.end();
  });
});
