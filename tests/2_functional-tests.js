const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    const boardName = 'testBoard';
    const threadText = 'testThread'
    const replyText = 'testReply'
    let threadId;
    let replyId;
    const validPassword = 'validPassword';
    const invalidPassword = 'invalidPassword';

  test('Creating a new thread: POST request to /api/threads/{board}', function(done) {
    chai.request(server)
      .post(`/api/threads/${boardName}`)
      .send({ text: threadText, delete_password: validPassword })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body)
        assert.equal(res.body.message, `New thread "${threadText}" posted successfully on board "${boardName}"`)
        threadId = res.body.threadId
        done();
      });
  });

  test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function(done) {
    chai.request(server)
      .get(`/api/threads/${boardName}`)
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtMost(res.body.length, 10);
        assert.property(res.body[0], 'replies');
        assert.isArray(res.body[0].replies);
        assert.isAtMost(res.body[0].replies.length, 3);
        done();
      });
  });

  test('Deleting a thread with the invalid password: DELETE request to /api/threads/{board}', function(done) {
    chai.request(server)
      .delete(`/api/threads/${boardName}`)
      .send({ thread_id: threadId, delete_password: invalidPassword })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  test('Reporting a thread: PUT request to /api/threads/{board}', function(done) {
    chai.request(server)
      .put(`/api/threads/${boardName}`)
      .send({ thread_id: threadId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });

  test('Creating a new reply: POST request to /api/replies/{board}', function(done) {
    chai.request(server)
      .post(`/api/replies/${boardName}`)
      .send({ thread_id: threadId, text: replyText, delete_password: validPassword })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.message, 'Reply has been added');
        replyId = res.body.replyId
        done();
      });
  });

  test('Viewing a single thread with all replies: GET request to /api/replies/{board}', function(done) {
    chai.request(server)
      .get(`/api/replies/${boardName}`)
      .query({ thread_id: threadId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body._id, threadId);
        assert.isArray(res.body.replies);
        assert.equal(res.body.replies.slice(-1)[0].text, replyText)
        done();
      });
  });

  test('Reporting a reply: PUT request to /api/replies/{board}', function(done) {
    chai.request(server)
      .put(`/api/replies/${boardName}`)
      .send({ thread_id: threadId, reply_id: replyId })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });

  test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board}', function(done) {
    chai.request(server)
      .delete(`/api/replies/${boardName}`)
      .send({ thread_id: threadId, reply_id: replyId, delete_password: invalidPassword })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  test('Deleting a reply with the correct password: DELETE request to /api/replies/{board}', function(done) {
    chai.request(server)
      .delete(`/api/replies/${boardName}`)
      .send({ thread_id: threadId, reply_id: replyId, delete_password: validPassword })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });

  test('Deleting a thread with the correct password: DELETE request to /api/threads/{board}', function(done) {
      chai.request(server)
        .delete(`/api/threads/${boardName}`)
        .send({ thread_id: threadId, delete_password: validPassword })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
    });
  });