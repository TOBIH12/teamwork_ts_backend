import  chai  from 'chai';
import app from '../index';
import { describe, it } from 'mocha';
import request from "supertest";

const { expect } = chai;


describe('Create User Endpoint', () => {
    it('should create a new user successfully', async () => {
       const res = await request(app)
       .post('/api/v1/users/admin/createUser')
       .send({
           firstname: 'Joe',
           lastname: 'Doe',
           email: 'joe@gmail.com',
           password: 'password123',
           gender: 'male',
           jobrole: 'employee',
           department: 'engineering',
           address: '123 Main St'
       });
                expect(res.status).to.equal(201);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 'success');
                expect(res.body.data).to.have.property('message').that.includes('User Joe Doe created successfully');
                expect(res.body.data).to.have.property('id');
                expect(res.body.data).to.have.property('jobrole', 'employee');
               
    });
});