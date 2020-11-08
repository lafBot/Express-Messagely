const Router = require("express").Router;
const router = new Router();

const Message = require("../models/message");
const {ensureLoggedIn} = require("../middleware/auth");
const ExpressError = require("../expressError");


router.get("/:id", ensureLoggedIn, async function (req, res, next) {
    /* GET /:id - get detail of message.
            => {message: {id, body, sent_at, read_at,
                    from_user: {username, first_name, last_name, phone},
                    to_user: {username, first_name, last_name, phone}} */
    try {
      let username = req.user.username;
      let message = await Message.get(req.params.id);
  
      if (message.to_user.username !== username && message.from_user.username !== username) {
        throw new ExpressError("You must be logged in", 401);
      }
  
      return res.json({ message });
    }
  
    catch (err) {
      return next(err);
    }
});


router.post("/", ensureLoggedIn, async function (req, res, next) {
    /* POST / - post message.
      {to_username, body} => {message: {id, from_username, to_username, body, sent_at}} */
    try {
      let message = await Message.create({
        from_username: req.user.username,
        to_username: req.body.to_username,
        body: req.body.body
      });
  
      return res.json({ message });
    }
  
    catch (err) {
      return next(err);
    }
  });


router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
    /* POST/:id/read - mark message as read and only allow read by proper user
      => {message: {id, read_at}} */
    try {
      let username = req.user.username;
      let msg = await Message.get(req.params.id);
  
      if (msg.to_user.username !== username) {
        throw new ExpressError("Cannot set this message to read", 401);
      }
      let message = await Message.markRead(req.params.id);
  
      return res.json({ message });
    }
  
    catch (err) {
      return next(err);
    }
  });
  
  
  module.exports = router;