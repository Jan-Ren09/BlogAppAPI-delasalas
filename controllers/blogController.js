const Blog = require('../models/Blog');

// Get all blogs
module.exports.getBlogs = (req, res) => {
    Blog.find()
        .sort({ createdAt: -1 })
        .then(blogs => {
            res.status(200).json(blogs);
        })
        .catch(err => {
            res.status(500).json({ message: err.message });
        });
};

// Create a new blog
module.exports.createBlog = (req, res) => {
    const { title, content } = req.body;
    const {username} = req.user
    console.log(req.user)

    const newBlog = new Blog({
        title,
        content,
        author: username
    });

    newBlog.save()
        .then(savedBlog => {
            res.status(201).json(savedBlog);
        })
        .catch(err => {
            res.status(400).json({ message: err.message });
        });
};

// Add a comment to a blog
module.exports.addComment = (req, res) => {
    const { blogId } = req.params;
    const {username} = req.user
    const {comment } = req.body; 

    
    if (!comment) {
        return res.status(400).json({ message: 'Comment can not be blank' });
    }

    Blog.findByIdAndUpdate(
        blogId,
        {$push: {comments: { commentor: username, comment }}},
        { new: true, }
    )
    .then(updatedBlog => {
        if (!updatedBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.status(200).json({message: 'Comment added', updatedBlog});
    })
    .catch(err => {
        res.status(500).json({ message: err.message });
    });
};

module.exports.getABlog = (req, res) => {
    const {blogId} = req.params;
    Blog.findById(blogId)
    .then(blog => {
        if (blog) {
            return res.status(200).json(blog)
        }
    })
    .catch(err => {
        res.status(500).json({ message: err.message });
    });
}

// Delete a comment from a blog
module.exports.deleteComment = (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id; 
    const isAdmin = req.user.isAdmin; 
    const username = req.user.username; // Get the username

    // Find the blog by the comment ID
    Blog.findOne({ 'comments._id': commentId }) 
    .then(blog => {
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const comment = blog.comments.id(commentId);
        // Check if the commentor is the user or if the blog author is the user, or if the user is an admin
        if (comment.commentor.toString() !== userId && blog.author !== username && !isAdmin) {
            return res.status(403).json({ message: 'You are not authorized to delete this comment' });
        }

        // Proceed to delete the comment
        Blog.findOneAndUpdate(
            { 'comments._id': commentId }, 
            { $pull: { comments: { _id: commentId } } }, 
            { new: true } 
        )
        .then(updatedBlog => {
            res.status(200).json({ message: 'Comment deleted successfully', updatedBlog });
        });
    })
    .catch(err => {
        res.status(500).json({ message: err.message });
    });
};



//Edit blog
module.exports.editBlog = (req, res) => {
    const {username} = req.user;
    const {title, content} = req.body;
    const {blogId} = req.params;
    
    Blog.findById(blogId)
    .then(blog => {
        if (blog.author.toString() !== username){
            res.status(401).json({message : "Actiion invalid, You are not the author of this Blog"})
        }else {
            Blog.findByIdAndUpdate(blogId, {
                title,
                content
            },{new: true})
            .then(updatedBlog => {
                res.status(200).json({message : "Blog updated successfully", updatedBlog})
            })
        }
    })
}


// Delete a blog
module.exports.deleteBlog = (req, res) => {
    const { blogId } = req.params;
    const userId = req.user.id; 
    const isAdmin = req.user.isAdmin; 
    const username = req.user.username; 
    console.log(username)

    Blog.findById(blogId)
        .then(blog => {
            if (!blog) {
                return res.status(404).json({ message: 'Blog not found' });
            }

            
            if (blog.author !== username && !isAdmin) {
                return res.status(403).json({ message: 'You are not authorized to delete this blog' });
            }

            // Proceed to delete the blog
            Blog.findByIdAndDelete(blogId)
                .then(() => {
                    res.status(200).json({ message: 'Blog deleted successfully' });
                })
                .catch(err => {
                    res.status(500).json({ message: err.message });
                });
        })
        .catch(err => {
            res.status(500).json({ message: err.message });
        });
};