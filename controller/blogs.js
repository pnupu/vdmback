const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const { request, response } = require('express')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user')
    response.json(blogs.map(blog => blog.toJSON()))
})


blogRouter.post('/', async (request, response ) => {
    const body = request.body
    const token = request.token
    console.log(request.token)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id,
        comments: body.comments

    })
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.json(savedBlog.toJSON())
})

blogRouter.delete('/:id', async (request, response) => {
    const token = request.token
    const blog = await Blog.findById(request.params.id)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
        response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)
    if ( blog.user.toString() === user._id.toString() ){
        await Blog.findByIdAndRemove(request.params.id)
        response.status(204).end()
    }


})


blogRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id).populate('user')
    response.json(blog.toJSON())
})

blogRouter.put('/:id/comments', async (request, response) => {
    const body = request.body
    const blog = {
        id: body.id,
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes === undefined ? 0 : body.likes,
        comments: body.comments === undefined ? [] : body.comments
    }
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog,  { new: true })
    response.json(updatedBlog.toJSON())
})

blogRouter.put('/:id', async (request, response) => {
    const body = request.body
    const blog = {
        id: body.id,
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes === undefined ? 0 : body.likes,
        comments: body.comments === undefined ? [] : body.comments
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog,  { new: true })
    response.json(updatedBlog.toJSON())
})

module.exports = blogRouter