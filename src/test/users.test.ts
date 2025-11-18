import  chai  from 'chai';
import app from '../index';
import { describe, it } from 'mocha';
import request from "supertest";

const { expect } = chai;


describe('Sign In User Endpoint', () => {
    it('should sign in a user successfully', async () => {
       const res = await request(app)
       .post('/api/v1/users/signin')
       .send({
           email: 'jane@gmail.com',
           password: 'password123',
       });
                expect(res.status).to.equal(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('status', 'success');
                expect(res.body.data).to.have.property('token');
                expect(res.body.data).to.have.property('id');
                expect(res.body.data).to.have.property('jobrole', 'employee');
               
    });
});