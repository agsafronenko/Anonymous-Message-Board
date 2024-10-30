"use strict";

const { Board } = require("../db");

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .post(async (req, res) => {
      
      const newThread = {
        text: req.body.text,
        delete_password: req.body.delete_password,
      };

      try {
        let board = await Board.findOne({ title: req.body.board || req.params.board });

        if (!board) {
          board = new Board({
            title: req.body.board || req.params.board,
            threads: [newThread],
          });
        } else {
          board.threads.push(newThread);
        }

        await board.save();
        res.json({threadId: board.threads[board.threads.length - 1]._id, message: `New thread "${req.body.text}" posted successfully on board "${req.body.board || req.params.board}"`});
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error saving thread");
      }
    })
    .get(async (req, res) => {
      try {
        const board = await Board.findOne({ title: req.params.board });
        if (!board) return res.status(404).send("Board not found");
        const threads = board.threads
          .sort((a, b) => b.bumped_on - a.bumped_on)
          .slice(0, 10)
          .map((thread) => ({
            _id: thread._id,
            text: thread.text,
            created_on: thread.created_on,
            bumped_on: thread.bumped_on,
            replies: thread.replies
              .slice(-3)
              .map((reply) => ({
                _id: reply._id,
                text: reply.text,
                created_on: reply.created_on,
              })),
            replyCount: thread.replies.length,
          }));

        res.json(threads);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error fetching threads");
      }
    })
    .put(async (req, res) => {

      try {
        const board = await Board.findOne({ title: req.params.board });
        if (!board) return res.status(404).send("Board not found");
        const thread = board.threads.id(req.body.thread_id);
        if (!thread) return res.status(404).send("Thread not found");
        thread.reported = true;
        await board.save();
        res.send("reported");
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error reporting thread");
      }
    })
    .delete(async (req, res) => {

      try {
        const board = await Board.findOne({ title: req.params.board });
        if (!board) return res.status(404).send("Board not found");
        const thread = board.threads.id(req.body.thread_id);
        if (!thread) return res.status(404).send("Thread not found");
        if (thread.delete_password === req.body.delete_password) {
          board.threads.pull({ _id: req.body.thread_id });
          await board.save();
          res.send("success");
        } else {
          res.send("incorrect password");
        }
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error deleting thread");
      }
    });

  app
    .route("/api/replies/:board")
    .post(async (req, res) => {
    
      const newReply = {
        text: req.body.text, 
        delete_password: req.body.delete_password,
      };
    
      try {
        const board = await Board.findOne({ title: req.params.board });
        if (!board) return res.status(404).send("Board not found");
        const thread = board.threads.id(req.body.thread_id);
        if (!thread) return res.status(404).send("Thread not found");
        thread.bumped_on = new Date()
        thread.replies.push(newReply);
        await board.save();
        res.json({replyId: thread.replies[thread.replies.length - 1]._id, message: "Reply has been added"});
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error adding reply");
      }
    })
    .get(async (req, res) => {

      try {
        const board = await Board.findOne({ title: req.params.board });
        if (!board) return res.status(404).send("Board not found");
        const thread = board.threads.id(req.query.thread_id);
        if (!thread) return res.status(404).send("Thread not found");

        const responseThread = {
          _id: thread._id,
          text: thread.text, 
          created_on: thread.created_on,
          bumped_on: thread.bumped_on, 
          replies: thread.replies.map((reply) => ({
            _id: reply._id,
            text: reply.text, 
            created_on: reply.created_on,
          })),
        };

        res.json(responseThread);
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error fetching replies");
      }
    })
    .put(async (req, res) => {

      try {
        const board = await Board.findOne({ title: req.params.board });
        if (!board) return res.status(404).send("Board not found");
        const thread = board.threads.id(req.body.thread_id);
        if (!thread) return res.status(404).send("Thread not found");
        const reply = thread?.replies.id(req.body.reply_id);
        if (!reply) return res.status(404).send("Reply not found");

        reply.reported = true;
        await board.save();
        res.send("reported");
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error reporting reply");
      }
    })
    .delete(async (req, res) => {
    
      try {
        const board = await Board.findOne({ title: req.params.board });
        if (!board) return res.status(404).send("Board not found");
        const thread = board.threads.id(req.body.thread_id);
        if (!thread) return res.status(404).send("Thread not found");
        const reply = thread?.replies.id(req.body.reply_id);
        if (!reply) return res.status(404).send("Reply not found");

        if (thread.delete_password === req.body.delete_password) {
          reply.text = "[deleted]"
          await board.save();
          res.send("success");
        } else {
          res.send("incorrect password");
        }
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error deleting thread");
      }
    });    
};
