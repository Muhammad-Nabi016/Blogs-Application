const express = require("express");
const authRoutes = require("./routes/auth");
const fs = require("fs");
const path = require("path");
const upload = require("./middleware/upload");
const authMiddleware = require("./middleware/authMiddleware");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;

const client = new MongoClient(process.env.MONGODB_URI);

let blogsCollection;
let usersCollection;
let commentsCollection;

async function connectDB() {
    try {
        await client.connect();

        const db = client.db("BlogApplication");
        blogsCollection = db.collection("blogs");
        usersCollection = db.collection("users");
        commentsCollection = db.collection("comments");

        console.log("MongoDB connected successfully!");
        console.log("Database: BlogApplication");

        app.use("/api/auth", authRoutes(usersCollection));

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
}

// Test Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "BlogSpace Backend is running!"
    });
});

// 1. GET All Blogs
app.get("/api/blogs", async (req, res) => {
    try {
        const blogs = await blogsCollection
            .find()
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            count: blogs.length,
            blogs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 2. GET Single Blog
app.get("/api/blogs/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }

        const blog = await blogsCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        res.status(200).json({
            success: true,
            blog
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// 3. CREATE Blog
app.post(
    "/api/blogs",
    authMiddleware,
    upload.single("image"),
    async (req, res) => {
        try {
            const { title, content, category, author } = req.body;

            if (!title || !content || !category || !author) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required"
                });
            }

            const newBlog = {
                title,
                content,
                category,
                author,
                imageUrl: req.file
                    ? `/uploads/${req.file.filename}`
                    : "",
                userId: req.user.userId,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await blogsCollection.insertOne(newBlog);

            res.status(201).json({
                success: true,
                message: "Blog created successfully!",
                blogId: result.insertedId
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


// 4. UPDATE Blog


app.put(
    "/api/blogs/:id",
    authMiddleware,
    upload.single("image"),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { title, content, category } = req.body;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid blog ID"
                });
            }

            if (!title || !content || !category) {
                return res.status(400).json({
                    success: false,
                    message: "Title, content and category are required"
                });
            }

            // Find existing blog owned by logged-in user
            const existingBlog = await blogsCollection.findOne({
                _id: new ObjectId(id),
                userId: req.user.userId
            });

            if (!existingBlog) {
                return res.status(404).json({
                    success: false,
                    message: "Blog not found or you are not authorized to update it"
                });
            }

            const updateData = {
                title,
                content,
                category,
                updatedAt: new Date()
            };

            if (req.file) {
                updateData.imageUrl = `/uploads/${req.file.filename}`;
            }

            const result = await blogsCollection.updateOne(
                {
                    _id: new ObjectId(id),
                    userId: req.user.userId
                },
                {
                    $set: updateData
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Blog could not be updated"
                });
            }

            // Delete old image if a new image was uploaded
            if (
                req.file &&
                existingBlog.imageUrl &&
                existingBlog.imageUrl.startsWith("/uploads/")
            ) {
                const oldFilename = path.basename(existingBlog.imageUrl);
                const oldImagePath = path.join(
                    __dirname,
                    "uploads",
                    oldFilename
                );

                await fs.promises.unlink(oldImagePath).catch(() => {});
            }

            res.status(200).json({
                success: true,
                message: "Blog updated successfully!"
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

// 5. CREATE Comment

app.post(
    "/api/blogs/:id/comments",
    authMiddleware,
    async (req, res) => {
        try {
            const { id } = req.params;
            const { text } = req.body;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid blog ID"
                });
            }

            if (!text || !text.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Comment cannot be empty"
                });
            }

            // Check if blog exists
            const blog = await blogsCollection.findOne({
                _id: new ObjectId(id)
            });

            if (!blog) {
                return res.status(404).json({
                    success: false,
                    message: "Blog not found"
                });
            }

            // Create new comment
            const newComment = {
                blogId: id,
                userId: req.user.userId,
                userName: req.user.name || req.user.email,
                text: text.trim(),
                createdAt: new Date()
            };

            const result = await commentsCollection.insertOne(newComment);

            res.status(201).json({
                success: true,
                message: "Comment added successfully!",
                commentId: result.insertedId
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

// 6. GET Comments for a Blog

app.get("/api/blogs/:id/comments", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }

        // Check if blog exists
        const blog = await blogsCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        // Fetch all comments for this blog
        const comments = await commentsCollection
            .find({ blogId: id })
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json({
            success: true,
            count: comments.length,
            comments
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 7. DELETE Comment

app.delete(
    "/api/blogs/:id/comments/:commentId",
    authMiddleware,
    async (req, res) => {
        try {
            const { id, commentId } = req.params;

            if (
                !ObjectId.isValid(id) ||
                !ObjectId.isValid(commentId)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid blog ID or comment ID"
                });
            }

            // Find the comment
            const comment = await commentsCollection.findOne({
                _id: new ObjectId(commentId),
                blogId: id
            });

            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message: "Comment not found"
                });
            }

            // Find the blog
            const blog = await blogsCollection.findOne({
                _id: new ObjectId(id)
            });

            if (!blog) {
                return res.status(404).json({
                    success: false,
                    message: "Blog not found"
                });
            }

            // Check delete permission
            const isCommentOwner =
                comment.userId === req.user.userId;

            const isBlogOwner =
                blog.userId === req.user.userId;

            if (!isCommentOwner && !isBlogOwner) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to delete this comment"
                });
            }

            // Delete comment
            await commentsCollection.deleteOne({
                _id: new ObjectId(commentId)
            });

            res.status(200).json({
                success: true,
                message: "Comment deleted successfully!"
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


 // 8. LIKE / UNLIKE Blog

app.post("/api/blogs/:id/like", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }

        // Find Blog
        const blog = await blogsCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        const userId = req.user.userId;

        // Check if user already liked the blog
        const alreadyLiked =
            Array.isArray(blog.likes) &&
            blog.likes.includes(userId);

        if (alreadyLiked) {
            // Unlike Blog
            await blogsCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $pull: {
                        likes: userId
                    }
                }
            );
        } else {
            // Like Blog
            await blogsCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $addToSet: {
                        likes: userId
                    }
                }
            );
        }

        // Get Updated Blog
        const updatedBlog = await blogsCollection.findOne({
            _id: new ObjectId(id)
        });

        res.status(200).json({
            success: true,
            message: alreadyLiked
                ? "Blog unliked successfully!"
                : "Blog liked successfully!",
            liked: !alreadyLiked,
            likesCount: updatedBlog.likes
                ? updatedBlog.likes.length
                : 0
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


 // 8. LIKE / UNLIKE Blog

app.post("/api/blogs/:id/like", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }

        // Find Blog
        const blog = await blogsCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        const userId = req.user.userId;

        // Check if user already liked the blog
        const alreadyLiked =
            Array.isArray(blog.likes) &&
            blog.likes.includes(userId);

        if (alreadyLiked) {
            // Unlike Blog
            await blogsCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $pull: {
                        likes: userId
                    }
                }
            );
        } else {
            // Like Blog
            await blogsCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $addToSet: {
                        likes: userId
                    }
                }
            );
        }

        // Get Updated Blog
        const updatedBlog = await blogsCollection.findOne({
            _id: new ObjectId(id)
        });

        res.status(200).json({
            success: true,
            message: alreadyLiked
                ? "Blog unliked successfully!"
                : "Blog liked successfully!",
            liked: !alreadyLiked,
            likesCount: updatedBlog.likes
                ? updatedBlog.likes.length
                : 0
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 5. DELETE Blog

app.delete("/api/blogs/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID"
            });
        }

        // Find blog belonging to logged-in user
        const blog = await blogsCollection.findOne({
            _id: new ObjectId(id),
            userId: req.user.userId
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found or you are not authorized to delete it"
            });
        }

        // Delete blog from MongoDB
        const result = await blogsCollection.deleteOne({
            _id: new ObjectId(id),
            userId: req.user.userId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Blog could not be deleted"
            });
        }

        // Delete uploaded image from uploads folder
        if (blog.imageUrl && blog.imageUrl.startsWith("/uploads/")) {
            const filename = path.basename(blog.imageUrl);
            const imagePath = path.join(__dirname, "uploads", filename);

            await fs.promises.unlink(imagePath).catch(() => {});
        }

        res.status(200).json({
            success: true,
            message: "Blog and its image deleted successfully!"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

connectDB();