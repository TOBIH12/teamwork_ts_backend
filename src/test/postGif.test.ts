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
});

// DELETE GIF
describe('Delete Gif endpoint', () => {
  let token = '';

  before(async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'samuel@gmail.com',
      password: 'password123',
    });
    if (!res.body || !res.body.data || !res.body.data.token) {
      console.log('Error signing in:', res.body);
    }

    token = res.body.data.token || res.body.token;

    const postGif = await request(app)
      .post('/api/v1/posts/post_gif')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'A friend')
      .attach(
        'gif',
        fs.readFileSync(path.join(__dirname, 'testFiles', 'avatar3.jpg')),
        'avatar3.jpg'
      );

    if (!postGif.body) {
      console.log('Error posting gif:', postGif.body);
    }

    const postGif2 = await request(app)
      .post('/api/v1/posts/post_gif')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'A friend')
      .attach(
        'gif',
        fs.readFileSync(
          path.join(__dirname, 'testFiles', 'Lookman-Osimhen.jpg')
        ),
        'Lookman-Osimhen.jpg'
      );

    if (!postGif2.body) {
      console.log('Error posting gif:', postGif2.body);
    }
  });

  it('should delete a gif successfully', async () => {
    const res = await request(app)
      .delete(`/api/v1/posts/gif/delete_gif/2`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('message', 'post deleted.');
  });

  it('should return 403 for attempt to delete another user gif', async () => {
    const res = await request(app)
      .delete('/api/v1/posts/gif/delete_gif/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(403);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `You cannot delete another user's post`
    );
  });

  it('should return error 404 for nonexisting gif post', async () => {
    const res = await request(app)
      .delete('/api/v1/posts/gif/delete_gif/6')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      'The gif must have deleted or does not exist.'
    );
  });
});

// ADMIN DELETE GIF
describe('Admin delete gif post endpoint', () => {
  let token = '';

  before(async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'dave@gmail.com',
      password: 'password123',
    });
    if (!res.body || !res.body.data || !res.body.data.token) {
      console.log('Error signing in:', res.body);
    }

    token = res.body.data.token || res.body.token;

    const postGif = await request(app)
      .post('/api/v1/posts/post_gif')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'A friend')
      .attach(
        'gif',
        fs.readFileSync(path.join(__dirname, 'testFiles', 'avatar3.jpg')),
        'avatar3.jpg'
      );

    if (!postGif.body) {
      console.log('Error posting gif:', postGif.body);
    }
  });

  it('should successfully delete another user gif post', async () => {
    const res = await request(app)
      .delete('/api/v1/posts/gif/admin_delete_gif/3')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('message', 'post deleted.');
  });

  it('should return 404 for nonexisting gif post', async () => {
    const res = await request(app)
      .delete('/api/v1/posts/gif/admin_delete_gif/2')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      'The gif must have deleted or does not exist.'
    );
  });
});

// FETCH ALL GIFS
describe('Fetch all Gifs endpoint', () => {
  let token = '';

  before(async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'dave@gmail.com',
      password: 'password123',
    });
    if (!res.body || !res.body.data || !res.body.data.token) {
      console.log('Error signing in:', res.body);
    }

    token = res.body.data.token || res.body.token;

    const postGif = await request(app)
      .post('/api/v1/posts/post_gif')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Another Lookalike friend')
      .attach(
        'gif',
        fs.readFileSync(path.join(__dirname, 'testFiles', 'avatar3.jpg')),
        'avatar3.jpg'
      );

    if (!postGif.body) {
      console.log('Error posting gif:', postGif.body);
    }
  });

  it('should fetch all gifs successfully', async () => {
    const res = await request(app)
      .get('/api/v1/posts/all_gifs/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      'Gifs fetched successfully'
    );
    expect(res.body.data).to.have.property('gifsCount');
    expect(res.body.data.gifsCount).to.be.a('number');
    expect(res.body.data.gifsCount).to.be.at.least(1);
    expect(res.body.data).to.have.property('gifs');
    expect(res.body.data.gifs).to.be.an('array');
    expect(res.body.data.gifs.length).to.equal(res.body.data.gifsCount);
  });

  it('should return error 401 for unauthorized access', async () => {
    const res = await request(app).get('/api/v1/posts/all_gifs/1');
    expect(res.status).to.equal(401);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `Authorization token is missing`
    );
  });
});

describe('Fetch User Gifs Endpoint', () => {
  let token = '';

  before(async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await pool.query(
      'INSERT into "users" (first_name, last_name, email, password, gender, job_role, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        'Esther',
        'Ogunleye',
        'esther@gmail.com',
        hashedPassword,
        'female',
        'employee',
        'computing',
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

  it(`it should successfully fetch a user's posted gifs`, async () => {
    const res = await request(app)
      .get('/api/v1/posts/user_gifs/1/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      `User's Gifs fetched successfully`
    );
    expect(res.body.data.userGifsCount).to.be.at.least(1);
    expect(res.body.data).to.have.property('gifs');
    expect(res.body.data.gifs).to.be.an('array');
  });

  it(`it should return success for existing user with no gif posts`, async () => {
    const res = await request(app)
      .get('/api/v1/posts/user_gifs/3/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('message', `No Gifs yet`);
  });

  it(`it should return error 404 for user not found`, async () => {
    const res = await request(app)
      .get('/api/v1/posts/user_gifs/6/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `A problem occured with finding this user`
    );
  });
});

describe('Fetch single Gif endpoint', () => {
  let token = '';

  before(async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'dave@gmail.com',
      password: 'password123',
    });
    if (!res.body || !res.body.data || !res.body.data.token) {
      console.log('Error signing in:', res.body);
    }

    token = res.body.data.token || res.body.token;
  });

  it('should fetch a single gif post successfully', async () => {
    const res = await request(app)
      .get('/api/v1/posts/gif/5')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      'gif successfully fetched'
    );
    expect(res.body.data).to.have.property('gifUrl');
  });

  it('should return error 404 for nonexisting gif post', async () => {
    const res = await request(app)
      .get('/api/v1/posts/gif/3')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('error', 'gif not found');
  });
});

describe('Like Gif Post endpoint', () => {
  let token = '';

  before(async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'dave@gmail.com',
      password: 'password123',
    });
    if (!res.body || !res.body.data || !res.body.data.token) {
      console.log('Error signing in:', res.body);
    }

    token = res.body.data.token || res.body.token;
  });

  it('should like a gif post successfully', async () => {
    const res = await request(app)
      .post('/api/v1/posts/likeGif/4')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('message', 'Gif liked!');
    expect(res.body.data).to.have.property('likes', 1);
  });

  it('should unlike a gif post successfully', async () => {
    const res = await request(app)
      .post('/api/v1/posts/likeGif/4')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('message', 'unliked gif!');
    expect(res.body.data).to.have.property('likes', 0);
  });

  it('should return error 404 for nonexisting gif post', async () => {
    const res = await request(app)
      .post('/api/v1/posts/likeGif/7')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      'gif might have been deleted or does not exist'
    );
  });
});

// COMMENT ON GIF
describe('Comment on Gif post endpoint', () => {
  let token = '';

  before(async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'dave@gmail.com',
      password: 'password123',
    });
    if (!res.body || !res.body.data || !res.body.data.token) {
      console.log('Error signing in:', res.body);
    }

    token = res.body.data.token || res.body.token;
  });

  it('should post a comment successfully', async () => {
    const res = await request(app)
      .post('/api/v1/posts/gif/comment/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: 'Hey Friend!',
      });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('message', 'comment posted!');
    expect(res.body.data).to.have.property('comment', 'Hey Friend!');
  });

  it('should return validation error for empty comment', async () => {
    const res = await request(app)
      .post('/api/v1/posts/gif/comment/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: '',
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'validation error');
    expect(res.body).to.have.property('error', 'Comment cannot be empty');
  });
});

// FETCH GIF COMMENTS ENDPOINT
describe('Fetch Gif comments Endpoint', () => {
  let token = '';

  before(async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'dave@gmail.com',
      password: 'password123',
    });
    if (!res.body || !res.body.data || !res.body.data.token) {
      console.log('Error signing in:', res.body);
    }

    token = res.body.data.token || res.body.token;
  });

  it('should fetch gif comments successfully', async () => {
    const res = await request(app)
      .get('/api/v1/posts/gif_comments/1/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      'comments fetched successfully'
    );
    expect(res.body.data).to.have.property('commentsCount', 1);
    expect(res.body.data.comments).to.be.an('array');
  });

  it('should return success for existing Gif without comments', async () => {
    const res = await request(app)
      .get('/api/v1/posts/gif_comments/4/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      'Be the first to comment on this post'
    );
    expect(res.body.data).to.have.property('commentsCount', 0);
  });

  it('should return error 404 for nonexisting gif post', async () => {
    const res = await request(app)
      .get('/api/v1/posts/gif_comments/8/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      'gif might have been deleted or does not exist'
    );
  });
});

// EDIT Gif COMMENT
describe('Edit comment endpoint', () => {
  let token = '';

  before(async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'dave@gmail.com',
      password: 'password123',
    });
    if (!res.body || !res.body.data || !res.body.data.token) {
      console.log('Error signing in:', res.body);
    }

    token = res.body.data.token || res.body.token;
  });

  it('should successfully edit a comment', async () => {
    const res = await request(app)
      .patch('/api/v1/posts/gif/edit_comment/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: 'Hello Friend',
      });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('message', 'comment updated!');
    expect(res.body.data).to.have.property('comment', 'Hello Friend');
  });

  it('should return validation error for empty comment', async () => {
    const res = await request(app)
      .patch('/api/v1/posts/gif/edit_comment/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: '',
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'validation error');
    expect(res.body).to.have.property('error', 'Comment cannot be empty');
  });

  it('should return 404 for nonexisting comment', async () => {
    const res = await request(app)
      .patch('/api/v1/posts/gif/edit_comment/3')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: 'Hello Friend',
      });
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      'comment might have been deleted or does not exist'
    );
  });
});

// DELETE Gif comment
describe('DELETE Gif comment Endpoint', () => {
  let token = '';

  before(async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'esther@gmail.com',
      password: 'password123',
    });
    if (!res.body || !res.body.data || !res.body.data.token) {
      console.log('Error signing in:', res.body);
    }

    token = res.body.data.token || res.body.token;

    const postComment2 = await request(app)
      .post('/api/v1/posts/gif/comment/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: 'Nice Picture',
      });

    if (!postComment2) {
      console.log('Error Posting second comment:', postComment2);
    }
    const postComment3 = await request(app)
      .post('/api/v1/posts/gif/comment/4')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: 'Good Picture!',
      });

    if (!postComment3) {
      console.log('Error Posting third comment:', postComment3);
    }
  });

  it('should delete a comment successfully', async () => {
    const res = await request(app)
      .delete('/api/v1/posts/gif/delete_comment/2')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body.data).to.have.property('message', 'comment deleted');
  });

  it('should return error 403 for unauthorized delete attempt', async () => {
    const res = await request(app)
      .delete('/api/v1/posts/gif/delete_comment/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(403);
    expect(res.body).to.have.property('error', 'Forbidden.');
  });
});

// ADMIN DELETE COMMENT
describe('Admin delete comment', () => {
  let token = '';

  before(async () => {
    const res = await request(app).post('/api/v1/users/signin').send({
      email: 'dave@gmail.com',
      password: 'password123',
    });
    if (!res.body || !res.body.data || !res.body.data.token) {
      console.log('Error signing in:', res.body);
    }

    token = res.body.data.token || res.body.token;
  });

  it('should delete another user`s comment successfully', async () => {
    const res = await request(app)
      .delete('/api/v1/posts/gif/admin_delete_comment/3')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body.data).to.have.property('message', 'comment deleted');
  });

  it('should return 404 for nonexisting comment', async () => {
    const res = await request(app)
      .delete('/api/v1/posts/gif/admin_delete_comment/6')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      'comment might have been deleted or does not exist'
    );
  });

  after(async () => {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE TABLE gifs RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE TABLE gif_likes RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE TABLE gif_comments RESTART IDENTITY CASCADE');
  });
});
