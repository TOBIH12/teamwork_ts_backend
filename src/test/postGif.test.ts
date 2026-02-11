import chai from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import app from '../index';
import pool from '../db';

const { expect } = chai;

// GIF POST TESTING

describe('Post GIFS Endpoint', () => {
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
    if (!res.body || !res.body.data || !res.body.data.token) {
      console.log('Error signing in:', res.body);
    }

    token = res.body.data.token || res.body.token;
  });

  it('should create a new gif successfully', async () => {
    const res = await request(app)
      .post('/api/v1/posts/post_gif')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Funny Dog')
      .attach(
        'gif',
        fs.readFileSync(
          path.join(__dirname, 'testFiles', 'Lookman-Osimhen.jpg')
        ),
        'Lookman-Osimhen.jpg'
      );
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('id');
    expect(res.body.data).to.have.property(
      'message',
      'GIF post created successfully'
    );
    expect(res.body.data).to.have.property('createdOn');
    expect(res.body.data).to.have.property('title', 'Funny Dog');
    expect(res.body.data).to.have.property('gifUrl');
    expect(res.body.data).to.have.property('authorId');
  }).timeout(30000);

  it('should return 400 if no GIF file is uploaded', async () => {
    const res = await request(app)
      .post('/api/v1/posts/post_gif')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'No Gif Post');
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('error', 'No GIF file uploaded');
  });

  after(async () => {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE TABLE gifs RESTART IDENTITY CASCADE');
  });
});
