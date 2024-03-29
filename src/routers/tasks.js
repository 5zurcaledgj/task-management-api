const express = require('express');
const router = new express.Router();
const authMiddleWare = require('../middleware/auth');

const Task = require('../models/task');

router.post('/tasks', authMiddleWare, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });

  try {
    await task.save();
    res.send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/tasks', authMiddleWare, async (req, res) => {
  let match = {};
  if (req.query.isDone) {
    match.isDone = 'true' === req.query.isDone;
  }

  let options = {};
  if (req.query.limit) {
    options.limit = parseInt(req.query.limit);
  }

  if (req.query.skip) {
    options.skip = parseInt(req.query.skip);
  }

  let sort = {};
  if (req.query.sortBy) {
    const [field, order] = req.query.sortBy.split('_');
    const _order = {
      asd: 1,
      desc: -1
    };

    sort[field] = _order[order];
  }

  options = { ...options, sort };
  try {
    await req.user
      .populate({
        path: 'tasks',
        match,
        options
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/tasks/:id', authMiddleWare, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    res.send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch('/tasks/:id', authMiddleWare, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete('/tasks/:id', async (req, res) => {
  try {
    const user = await Task.findByIdAndDelete(req.params.id);
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
