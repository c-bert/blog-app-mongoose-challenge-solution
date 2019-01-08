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

//write a function to generate data to put into the database
function generateBlogData() {
    return {
        author: {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        },
        title: faker.lorem.sentence(),
        content: faker.lorem.text()
    };
}

function tearDownDatabase() {
    console.warm('Deleting Database');
    return mongoose.connection.dropDatabase();
}

describe('Blogs API resrouce', function(){ 
    //create hook functions to return a promise
before(function() {
    return runServer(TEST_DATABASE_URL);
});

beforeEach(function() {
    return seedData();
});

afterEach(function(){
    return tearDownDatabase();
});

after(function(){
    return closeServer();
});

describe('GET endpoint', function(){
    it('should return all blog posts', function(){
    // strategy:
      //1. get back all restaurants returned by by GET request to `/restaurants`
      //2. prove res has right status, data type
      //3. prove the number of restaurants we got back is equal to number in db.
      let res;
      return chai.request(app)
      .get('/posts')
      .then(function(_res){
        res = _res;
        expect(res).to.have.status(200);
        //otherwise the seed db didn't work
        expect(res.body.posts).to.have.lengthOf.at.least(1);
      })
      .then(function(count){
       expect(res.body.posts).to.have.lengthOf(count);     
    });
    });


it('should return blog posts with the right fields', function(){
    //strategy
    //Get back all posts and ensure they have expected keys

    let resPost;
    return chai.request(app)
    .get('/posts')
    .then(function(res){
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body.posts).to.be.a('array');
        expect(res.body.posts).to.have.lengthOf.at.least(1);

        res.body.posts.forEach(function(blogpost) {
            expect(blogpost).to.be.a('object');
            expect(blogpost).to.include.keys('author', 'title', 'content', 'created');
        });
        resPost = res.body[0];
        return BlogPost.findById(resPost.id);
    })
    .then(function(posts) {

        expect(resPost.title).to.equal(post.title);
        expect(resPost.content).to.equal(post.content);
        expect(resPost.author).to.equal(post.author);
    });
});    
});

// strategy: make a POST request with data,
    // then prove that the post we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
describe('POST endpoint', function(){
    it('should add a new blog post', function(){

        const newPost = generateBlogData();
        
        return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then(function(res){
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('id', 'title', 'content', 'author');
            expect(res.body.author).to.should.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
            expect(res.body.id).to.not.be.null;
            expect(res.body.title).to.equal(newPost.title);
            expect(res.body.content).to.equal(newPost.content);
            return BlogPost.findById(res.body.id);
        });
    })
})
// strategy:
    //  1. Get an existing post from db
    //  2. Make a PUT request to update that post
    //  4. Prove post in db is correctly updated
describe('PUT endpoint', function(){


    it('should update fields sent over', function(){
        const updateData = {
            title: 'Who Lives in a Pineapple Down by the Sea',
            content: 'Sandy: Patrick, why does you home have legs on it? Patrick: Well this is my mobile home',
            author: {
                firstName: 'Spongebob',
                lastName: 'Squarepants'
            }
        };
        return BlogPost
        .findOne()
        .then(function(post){
            updateData.id = post.id;

            return chai.request(app)
            .put(`/posts/${post.id}`)
            .send(updateData);
        })
        .then(function(res){
            expect(res).to.have.status(204);

            return BlogPost.findById(updateData.id);
        })
        .then(function(post) {
            expect(post.author.firstName).to.equal(updateData.author.firstName);
            expect(post.author.lastName).to.equal(updateData.author.lastName);
            expect(post.title).to.equal(updateData.title);
            expect(post.content).to.equal(updateData.content);
        });
    });
});

describe('DELETE endpoint', function(){

    it('should delete a post by id', function() {
        let post;

        return BlogPost
        .findOne()
        .then(function(_post){
            post = _post;
            return chai.request(app).delete(`/posts/${post.id}`);
        })
        .then(function(res){
            expect(res).to.have.status(204);
            return BlogPost.findById(post.id);
        })
        .then(function(_post){
            expect(_post).to.be.null;
        });
     });
  }); 
});