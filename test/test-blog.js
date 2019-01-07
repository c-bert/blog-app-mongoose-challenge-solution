'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {BlogPost} = require('../models');
const { runServer, app, closeServer } = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

//use randomish data to seed a database using Faker library
function seedData() {
    console.info('seeding blogging data');
    const seedData = [];

    for (let i=1; i<=0; i++) {
        seedData.push(generateBlogData());   
    }
    //this will return a promise
    return BlogPost.insertMany(seedData);
}