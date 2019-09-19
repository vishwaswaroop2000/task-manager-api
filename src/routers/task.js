const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
  // const task = new Task(req.body)
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })
  try {
    await task.save()
    res.status(201).send(task)
  }
  catch (error) {
    res.status(400).send(error)
  }
})

//GET/task?completed=true
//GET/task?limit=10&skip=20
//GET/tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
  try {
    const match = {}
    const sort = {}
    if (req.query.completed)
      match.completed = req.query.completed === 'true'
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':')
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    // const task = await Task.find({ owner: req.user._id })
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    res.send(req.user.tasks)
  }
  catch (e) {
    res.status(500).send()
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOne({ _id, owner: req.user._id })
    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  }
  catch (e) {
    res.status(500).send()
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const updateIsAllowed = updates.every((update) => allowedUpdates.includes(update))
  if (!updateIsAllowed)
    return res.status(400).send({ error: "Updating non-existent fields not possible" })
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
    if (!task)
      return res.status(404).send()
    updates.forEach((update) => {
      task[update] = req.body[update]
    })
    await task.save()
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true })
    res.send(task)
  }
  catch (e) {
    res.status(500).send(e.message)
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    if (!task)
      return res.status(404).send()
    res.send(task)
  }
  catch (e) {
    res.status(500).send()
  }
})

router.delete('/tasks/', auth, async (req, res) => {
  try {
    const task = await Task.deleteMany({ owner: req.user._id })
    res.send(task)
  }
  catch (e) {
    res.status(500).send(e.message)
  }
})
module.exports = router

