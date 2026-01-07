import chai from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../index';

const { expect } = chai;

// GIF POST TESTING

describe('Post GIFS Endpoint', () => {
  it('should create a new gif successfully', async () => {
    const res = await request(app)
      .post('/api/v1/posts/post_gif')
      .set(
        'Authorization',
        `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImJvbGFqaUBnbWFpbC5jb20iLCJqb2Jyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Njc3NjgxMDEsImV4cCI6MTc2Nzg1NDUwMX0.tfyKSLVHOamuxPpFUTQGSTxMJylLrLkwzEq0V8FiT_k`
      )
      .field('title', 'Funny Cat')
      .attach(
        'gif',
        fs.readFileSync(
          path.join(__dirname, 'testFiles', 'Lookman-Osimhen.jpg')
        ),
        'Lookman-Osimhen.jpg'
      );
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('gif_id');
    expect(res.body.data).to.have.property(
      'message',
      'GIF post created successfully'
    );
    expect(res.body.data).to.have.property('createdOn');
    expect(res.body.data).to.have.property('title', 'Funny Cat');
    expect(res.body.data).to.have.property('gifUrl');
    expect(res.body.data).to.have.property('authorId');
  }).timeout(20000);

  it('should return 400 if no GIF file is uploaded', async () => {
    const res = await request(app)
      .post('/api/v1/posts/post_gif')
      .set(
        'Authorization',
        `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImJvbGFqaUBnbWFpbC5jb20iLCJqb2Jyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Njc3NjgxMDEsImV4cCI6MTc2Nzg1NDUwMX0.tfyKSLVHOamuxPpFUTQGSTxMJylLrLkwzEq0V8FiT_k`
      )
      .field('title', 'No Gif Post');
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('error', 'No GIF file uploaded');
  });
});
