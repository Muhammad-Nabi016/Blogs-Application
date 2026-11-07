
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api/blogs";

function BlogDetails() {
    const { id } = useParams();

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Comments States
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentMessage, setCommentMessage] = useState("");

    // Likes States
    const [likes, setLikes] = useState([]);
    const [isLiked, setIsLiked] = useState(false);

    // Current Logged-in User
    const [currentUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });

    // Fetch Blog Details
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`${API_URL}/${id}`);

                const fetchedBlog = response.data.blog;

                setBlog(fetchedBlog);

                const blogLikes = fetchedBlog.likes || [];
                setLikes(blogLikes);

                if (currentUser) {
                    setIsLiked(blogLikes.includes(currentUser.id));
                }

            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Unable to load blog details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id, currentUser]);

    // Fetch Comments
    const fetchComments = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/${id}/comments`
            );

            setComments(response.data.comments);

        } catch (error) {
            console.log("Error fetching comments:", error);
        } finally {
            setCommentsLoading(false);
        }
    };

    // Load Comments
    useEffect(() => {
        fetchComments();
    }, [id]);

    // Add Comment
    const handleAddComment = async (e) => {
        e.preventDefault();

        if (!commentText.trim()) {
            setCommentMessage("Please enter a comment.");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setCommentMessage("Please login to add a comment.");
                return;
            }

            await axios.post(
                `${API_URL}/${id}/comments`,
                {
                    text: commentText
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setCommentText("");
            setCommentMessage("Comment added successfully!");

            await fetchComments();

        } catch (error) {
            setCommentMessage(
                error.response?.data?.message ||
                "Unable to add comment."
            );
        }
    };

    // Delete Comment
    const handleDeleteComment = async (commentId) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setCommentMessage("Please login first.");
                return;
            }

            await axios.delete(
                `${API_URL}/${id}/comments/${commentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setCommentMessage("Comment deleted successfully!");

            await fetchComments();

        } catch (error) {
            setCommentMessage(
                error.response?.data?.message ||
                "Unable to delete comment."
            );
        }
    };

    // Like / Unlike Blog
    const handleLike = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setCommentMessage("Please login to like this blog.");
                return;
            }

            const response = await axios.post(
                `${API_URL}/${id}/like`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setIsLiked(response.data.liked);

            if (response.data.liked) {
                setLikes((prevLikes) => {
                    if (prevLikes.includes(currentUser?.id)) {
                        return prevLikes;
                    }

                    return [...prevLikes, currentUser.id];
                });
            } else {
                setLikes((prevLikes) =>
                    prevLikes.filter(
                        (userId) => userId !== currentUser?.id
                    )
                );
            }

        } catch (error) {
            setCommentMessage(
                error.response?.data?.message ||
                "Unable to like blog."
            );
        }
    };

    // Loading State
    if (loading) {
        return <p>Loading blog details...</p>;
    }

    // Error State
    if (error || !blog) {
        return (
            <div>
                <h2>{error || "Blog not found."}</h2>
                <Link to="/">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="blog-details-page">

            <Link to="/" className="back-link">
                ← Back to Home
            </Link>

            <div className="blog-details-card">

                {/* Blog Image */}
                <img
                    src={
                        blog.imageUrl
                            ? `http://localhost:5000${blog.imageUrl}`
                            : "https://images.unsplash.com/photo-1499750310107-5fef28a66643"
                    }
                    alt={blog.title}
                    className="details-image"
                />

                <div className="details-content">

                    {/* Blog Information */}
                    <span className="category">
                        {blog.category}
                    </span>

                    <h1>{blog.title}</h1>

                    <div className="details-meta">
                        <span>By {blog.author}</span>

                        <span>
                            {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Blog Like Button */}
                    <div className="blog-like-section">

                        <button
                            className={`like-btn ${isLiked ? "liked" : ""}`}
                            onClick={handleLike}
                        >
                            {isLiked ? "❤️ Unlike" : "🤍 Like"}
                        </button>

                        <span className="likes-count">
                            {likes.length} Likes
                        </span>

                    </div>

                    {/* Full Blog Content */}
                    <div
                        className="full-blog-content"
                        dangerouslySetInnerHTML={{
                            __html: blog.content
                        }}
                    />

                    {/* Comments Section */}
                    <div className="comments-section">

                        <h2>Comments ({comments.length})</h2>

                        {/* Add Comment Form */}
                        <form
                            className="comment-form"
                            onSubmit={handleAddComment}
                        >

                            <textarea
                                placeholder="Write your comment..."
                                value={commentText}
                                onChange={(e) =>
                                    setCommentText(e.target.value)
                                }
                                rows="4"
                            />

                            <button type="submit">
                                Add Comment
                            </button>

                            {commentMessage && (
                                <p>{commentMessage}</p>
                            )}

                        </form>

                        {/* Comments List */}
                        {commentsLoading ? (
                            <p>Loading comments...</p>
                        ) : comments.length === 0 ? (
                            <p>No comments yet. Be the first to comment!</p>
                        ) : (
                            <div className="comments-list">

                                {comments.map((comment) => (
                                    <div
                                        className="comment-card"
                                        key={comment._id}
                                    >

                                        <h4>{comment.userName}</h4>

                                        <p>{comment.text}</p>

                                        <small>
                                            {new Date(
                                                comment.createdAt
                                            ).toLocaleString()}
                                        </small>

                                        {/* Delete Permission */}
                                        {currentUser &&
                                            (
                                                comment.userId === currentUser.id ||
                                                blog.userId === currentUser.id
                                            ) && (
                                                <button
                                                    className="delete-comment-btn"
                                                    onClick={() =>
                                                        handleDeleteComment(comment._id)
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            )
                                        }

                                    </div>
                                ))}

                            </div>
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default BlogDetails;
