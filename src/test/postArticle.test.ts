import chai from 'chai';
import { describe, it } from 'mocha';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../index';
import pool from '../db';

const { expect } = chai;

// ARTICLE POST TESTS

describe('Post Article Endpoint', () => {
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

  it('should create a new article successfully', async () => {
    const res = await request(app)
      .post('/api/v1/posts/post_article')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Post article endpoint test',
        content: 'Our very first artcile post!',
        category: 'technology',
      });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.be.an('object');
    expect(res.body.data).to.have.property('message', 'Article posted!');
    expect(res.body.data).to.have.property(
      'title',
      'Post article endpoint test'
    );
    expect(res.body.data).to.have.property(
      'content',
      'Our very first artcile post!'
    );
  });

  it('should return validation error for empty title or content string', async () => {
    const res = await request(app)
      .post('/api/v1/posts/post_article')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '',
        content: 'Our very first article post!',
        category: 'technology',
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'validation error');
    expect(res.body).to.have.property('error', 'Title is required');
  });

  it('should return authorization error for missing token', async () => {
    const res = await request(app).post('/api/v1/posts/post_article').send({
      title: 'Post article endpoint test',
      content: 'Our very first article post!',
      category: 'technology',
    });
    expect(res.status).to.equal(401);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `Authorization token is missing`
    );
  });
});

describe('Edit Article Endpoint', () => {
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

    const postArticle = await request(app)
      .post('/api/v1/posts/post_article')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Edit article endpoint test',
        content: 'Our second article post!',
        category: 'technology',
      });

    if (!postArticle) {
      console.log('Error posting article:', postArticle);
    }
  });

  it('should edit an article successfully', async () => {
    const res = await request(app)
      .patch('/api/v1/posts/article/edit_article/2')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Edit article endpoint test',
        content: 'Edited version of our second article',
      });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.be.an('object');
    expect(res.body.data).to.have.property('message', 'update successful.');
    expect(res.body.data).to.have.property(
      'title',
      'Edit article endpoint test'
    );
    expect(res.body.data).to.have.property(
      'content',
      'Edited version of our second article'
    );
  });

  it(`should return error 403 for updating another user's article`, async () => {
    const res = await request(app)
      .patch('/api/v1/posts/article/edit_article/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Edit article endpoint test',
        content: 'failed edit version of our second article',
      });
    expect(res.status).to.equal(403);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('error', `Forbidden.`);
  });

  it('should return validation error for missing title or content field', async () => {
    const res = await request(app)
      .patch('/api/v1/posts/article/edit_article/2')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Edit article endpoint test',
        content: '',
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'validation error');
    expect(res.body).to.have.property('error', 'Content is required');
  });
});

describe('Delete Article Endpoint', () => {
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

    const postArticle2 = await request(app)
      .post('/api/v1/posts/post_article')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Delete article endpoint test',
        content: 'Our third article post!',
        category: 'technology',
      });

    if (!postArticle2) {
      console.log('Error posting article:', postArticle2);
    }

    const postArticle3 = await request(app)
      .post('/api/v1/posts/post_article')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Delete article endpoint test',
        content: 'Our fourth article post!',
        category: 'technology',
      });

    if (!postArticle3) {
      console.log('Error posting article:', postArticle3);
    }
  });

  it('should delete an article successfully', async () => {
    const res = await request(app)
      .delete(`/api/v1/posts/article/delete_article/2`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('message', 'post deleted.');
  });

  it('should return 403 for attempt to delete another user article', async () => {
    const res = await request(app)
      .delete(`/api/v1/posts/article/delete_article/1`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(403);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('error', `Forbidden.`);
  });

  it('should return error 404 for nonexisting article post', async () => {
    const res = await request(app)
      .delete(`/api/v1/posts/article/delete_article/8`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      'article might have been deleted or does not exist.'
    );
  });
});

describe('Admin Delete Article Endpoint', () => {
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

    const postArticle = await request(app)
      .post('/api/v1/posts/post_article')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Delete article endpoint test',
        content: 'Our fifth article post!',
        category: 'technology',
      });

    if (!postArticle) {
      console.log('Error posting article:', postArticle);
    }
  });

  it('should successfully delete another user article post', async () => {
    const res = await request(app)
      .delete(`/api/v1/posts/article/admin_delete_article/3`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('message', 'post deleted.');
  });

  it('should return 404 for nonexisting article post', async () => {
    const res = await request(app)
      .delete(`/api/v1/posts/article/admin_delete_article/2`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      'article might have been deleted or does not exist.'
    );
  });
});

describe('Fetch All Articles Endpoint', () => {
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

  it('should fetch all available articles successfully', async () => {
    const res = await request(app)
      .get('/api/v1/posts/article/all_articles?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      'Articles successfully fetched'
    );
    expect(res.body.data).to.have.property('articlesCount');
    expect(res.body.data.articlesCount).to.be.a('number');
    expect(res.body.data.articlesCount).to.be.at.least(1);
    expect(res.body.data).to.have.property('articles');
    expect(res.body.data.articles).to.be.an('array');
    expect(res.body.data.articles.length).to.equal(res.body.data.articlesCount);
  });

  it('should return 401 for unauthorized access', async () => {
    const res = await request(app).get(
      '/api/v1/posts/article/all_articles?page=1&limit=10'
    );
    expect(res.status).to.equal(401);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `Authorization token is missing`
    );
  });
});

describe('Fetch User Articles Endpoint', () => {
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

  it(`it should fetch a user's post successfully`, async () => {
    const res = await request(app)
      .get('/api/v1/posts/article/user_articles/1/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      `User's Articles fetched successfully`
    );
    expect(res.body.data.userArticlesCount).to.be.at.least(1);
    expect(res.body.data).to.have.property('articles');
    expect(res.body.data.articles).to.be.an('array');
  });

  it(`it should return a message for existing user with no articles`, async () => {
    const res = await request(app)
      .get('/api/v1/posts/article/user_articles/3/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      `No Articles from this user yet`
    );
  });

  it(`it should return error 404 for user not found`, async () => {
    const res = await request(app)
      .get('/api/v1/posts/article/user_articles/8/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `A problem occured with finding this user`
    );
  });

  it('should return error for unauthorized access', async () => {
    const res = await request(app).get(
      '/api/v1/posts/article/user_articles/1/1'
    );
    expect(res.status).to.equal(401);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `Authorization token is missing`
    );
  });
});

describe('Fetch Category Articles Endpoint', () => {
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

  it(`should fetch articles of a category successfully`, async () => {
    const res = await request(app)
      .get('/api/v1/posts/article/category_articles/technology/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.be.an('object');
    expect(res.body.data).to.have.property(
      'message',
      `Category Articles fetched successfully`
    );
    expect(res.body.data).to.have.property('categoryArticlesCount');
    expect(res.body.data.categoryArticlesCount).to.be.a('number');
    expect(res.body.data.categoryArticlesCount).to.be.at.least(1);
    expect(res.body.data).to.have.property('articles');
    expect(res.body.data.articles).to.be.an('array');
    expect(res.body.data.articles.length).to.equal(
      res.body.data.categoryArticlesCount
    );
  });

  it(`should return a message for existing category with no articles`, async () => {
    const res = await request(app)
      .get('/api/v1/posts/article/category_articles/uncategorized/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      `No Articles in this category yet`
    );
  });
});

describe('Fetch Single Article Endpoint', () => {
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

  it('should fetch an article successfully', async () => {
    const res = await request(app)
      .get('/api/v1/posts/article/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      `Article fetched successfully`
    );
    expect(res.body.data).to.have.property('articleId');
  });

  it('should return 404 for post not found', async () => {
    const res = await request(app)
      .get('/api/v1/posts/article/9')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('error', 'Post not found');
  });

  it('should return error for unauthorized access', async () => {
    const res = await request(app).get('/api/v1/posts/article/1');
    expect(res.status).to.equal(401);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      `Authorization token is missing`
    );
  });
});

describe('Like Article Endpoint', () => {
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

  it('should like an article successfully', async () => {
    const res = await request(app)
      .post('/api/v1/posts/like_article/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('message', 'Article liked!');
    expect(res.body.data).to.have.property('likes', 1);
  });

  it('should unlike an article successfully', async () => {
    const res = await request(app)
      .post('/api/v1/posts/like_article/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('message', 'unliked article!');
    expect(res.body.data).to.have.property('likes', 0);
  });

  it('should return 404 for nonexisting article post', async () => {
    const res = await request(app)
      .post('/api/v1/posts/like_article/9')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      'article might have been deleted or does not exist'
    );
  });
});

describe('Comment on Article Endpoint', () => {
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

  it('should comment on an article successfully', async () => {
    const res = await request(app)
      .post('/api/v1/posts/article/comment/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: 'Nice Article',
      });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('message', 'comment posted!');
    expect(res.body.data).to.have.property('comment', 'Nice Article');
  });

  it('should return validation error for empty comment', async () => {
    const res = await request(app)
      .post('/api/v1/posts/article/comment/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: '',
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'validation error');
    expect(res.body).to.have.property('error', 'Comment cannot be empty');
  });

  it('should return validation error for Invalid article ID', async () => {
    const res = await request(app)
      .post('/api/v1/posts/article/comment/-1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: 'written comment',
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'validation error');
    expect(res.body).to.have.property('error', 'Invalid article ID');
  });
});

describe('Fetch Article Comments Endpoint', () => {
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

  it('should fetch comments for an article successfully', async () => {
    const res = await request(app)
      .get('/api/v1/posts/article_comments/1/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      'comments fetched successfully'
    );
    expect(res.body.data).to.have.property('commentsCount');
    expect(res.body.data.commentsCount).to.be.a('number');
    expect(res.body.data).to.have.property('comments');
    expect(res.body.data.comments).to.be.an('array');
  });

  it('should return 404 for nonexisting article post', async () => {
    const res = await request(app)
      .get('/api/v1/posts/article_comments/9/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      'article might have been deleted or does not exist'
    );
  });

  it('should return status success for existing article with no comments', async () => {
    const res = await request(app)
      .get('/api/v1/posts/article_comments/5/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property(
      'message',
      'Be the first to comment on this post'
    );
  });
});

describe('Edit Article Comment Endpoint', () => {
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

  it('should edit a comment successfully', async () => {
    const res = await request(app)
      .patch('/api/v1/posts/article/edit_comment/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: 'Hello Friend',
      });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('message', 'comment updated!');
    expect(res.body.data).to.have.property('comment', 'Hello Friend');
  });

  it('should return validation error for empty comment field', async () => {
    const res = await request(app)
      .patch('/api/v1/posts/article/edit_comment/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: '',
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'validation error');
    expect(res.body).to.have.property('error', 'Comment cannot be empty');
  });

  it('should return validation error for Invalid comment ID', async () => {
    const res = await request(app)
      .patch('/api/v1/posts/article/edit_comment/-1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: 'Hello Friends',
      });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'validation error');
    expect(res.body).to.have.property('error', 'Invalid comment ID');
  });

  it('should return error 404 for nonexisting comment', async () => {
    const res = await request(app)
      .patch('/api/v1/posts/article/edit_comment/4')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: 'Hello my Friends',
      });
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      'comment might have been deleted or does not exist'
    );
  });
});

describe('Delete Article Comment Endpoint', () => {
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

    const postComment2 = await request(app)
      .post('/api/v1/posts/article/comment/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: 'Nice Writeup',
      });

    if (!postComment2) {
      console.log('Error Posting second comment:', postComment2);
    }
    const postComment3 = await request(app)
      .post('/api/v1/posts/article/comment/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        comment: 'Write more!',
      });

    if (!postComment3) {
      console.log('Error Posting third comment:', postComment3);
    }
  });

  it('should delete a comment successfully', async () => {
    const res = await request(app)
      .delete('/api/v1/posts/article/delete_comment/2')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('message', 'comment deleted');
  });

  it('should return error 403 for attempt to delete another user comment', async () => {
    const res = await request(app)
      .delete('/api/v1/posts/article/delete_comment/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(403);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('error', `Forbidden.`);
  });

  it('should return error 404 for nonexisting comment', async () => {
    const res = await request(app)
      .delete('/api/v1/posts/article/delete_comment/999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      'comment might have been deleted or does not exist'
    );
  });

  it('should return validation error for Invalid comment ID', async () => {
    const res = await request(app)
      .delete('/api/v1/posts/article/delete_comment/-1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'validation error');
    expect(res.body).to.have.property('error', 'Invalid comment ID');
  });
});

describe('Admin Delete Article Comment Endpoint', () => {
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

  it('should delete another user comment successfully', async () => {
    const res = await request(app)
      .delete('/api/v1/posts/article/admin_delete_comment/3')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('message', 'comment deleted');
  });

  it('should return error 404 for nonexisting comment', async () => {
    const res = await request(app)
      .delete('/api/v1/posts/article/admin_delete_comment/999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property(
      'error',
      'comment might have been deleted or does not exist'
    );
  });

  it('should return validation error for Invalid comment ID', async () => {
    const res = await request(app)
      .delete('/api/v1/posts/article/admin_delete_comment/-1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'validation error');
    expect(res.body).to.have.property('error', 'Invalid comment ID');
  });

  after(async () => {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    await pool.query('TRUNCATE TABLE articles RESTART IDENTITY CASCADE');
  });
});
