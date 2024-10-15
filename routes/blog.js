const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController'); 
const { verify, verifyAdmin } = require('../auth'); 


// Route to get all blogs
router.get('/posts', blogController.getBlogs);

//Get a single post
router.get('/:blogId', blogController.getABlog)


// create a new blog
router.post('/',verify, blogController.createBlog);

// Edit Blog
router.patch('/:blogId', verify, blogController.editBlog)

// add a comment to a blog
router.post('/:blogId/comments',verify, blogController.addComment);

// delete a comment to a blog
router.patch('/comments/:commentId',verify, blogController.deleteComment);

//delete blog
router.delete('/:blogId',verify, blogController.deleteBlog);


module.exports = router;
