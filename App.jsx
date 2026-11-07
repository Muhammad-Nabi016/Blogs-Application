import { useState, useEffect } from "react";
import "./App.css";
import { Link, useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import BlogDetails from "./pages/BlogDetails";
import Login from "./pages/Login";
import axios from "axios";
import "./App.css";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const API_URL = "http://localhost:5000/api/blogs";

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    };
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    author: ""
  });

  // Fetch Blogs
  const fetchBlogs = async () => {
    try {
      const response = await axios.get(API_URL);
      setBlogs(response.data.blogs);
      setError("");
    } catch (error) {
      setError("Unable to load blogs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Reset Form
  
const resetForm = () => {
    setFormData({
        title: "",
        content: "",
        category: "",
        author: ""
    });

    setImage(null);
    setEditingId(null);
    setShowForm(false);
};

  // Create or Update Blog
const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const token = localStorage.getItem("token");

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        if (editingId) {
          const blogData = new FormData();
          blogData.append("title", formData.title);
          blogData.append("content", formData.content);
          blogData.append("category", formData.category);

          if (image) {
            blogData.append("image", image);
          }

          await axios.put(
            `${API_URL}/${editingId}`,
            blogData,
            config
          );

          setMessage("Blog updated successfully!");
        }
        else {
            const blogData = new FormData();

            blogData.append("title", formData.title);
            blogData.append("content", formData.content);
            blogData.append("category", formData.category);
            blogData.append("author", formData.author);

            if (image) {
                blogData.append("image", image);
            }

            await axios.post(
                API_URL,
                blogData,
                config
            );

            setMessage("Blog created successfully!");
        }

        resetForm();
        setImage(null);

        await fetchBlogs();

    } catch (error) {
        setMessage(
            error.response?.data?.message || "Operation failed."
        );
    }
};

  // Edit Blog
  
const handleEdit = (blog) => {
    setFormData({
        title: blog.title,
        content: blog.content,
        category: blog.category,
        author: blog.author
    });

    setImage(null);
    setEditingId(blog._id);
    setShowForm(true);
    setMessage("");

    document.getElementById("blogs").scrollIntoView({
        behavior: "smooth"
    });
};

  // Delete Blog
  
const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
        "Are you sure you want to delete this blog?"
    );

    if (!confirmDelete) return;

    try {
        const token = localStorage.getItem("token");

        await axios.delete(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        setMessage("Blog deleted successfully!");

        await fetchBlogs();

    } catch (error) {
        setMessage(
            error.response?.data?.message || "Failed to delete blog."
        );
    }
};

  // Search Blogs
  const filteredBlogs = blogs.filter((blog) =>
    `${blog.title} ${blog.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="app">

      
{/* Navbar */}
<nav className="navbar">
    <div className="logo">
        Blog Application<span>.</span>
    </div>

    <div className="nav-links">
        <a href="/">Home</a>
        <a href="#blogs">Blogs</a>
        <a href="#about">About</a>
    </div>

    <div className="nav-auth">
        {token ? (
            <button
                className="logout-btn"
                onClick={handleLogout}
            >
                Logout
            </button>
        ) : (
            <>
                <Link to="/login" className="nav-login">
                    Login
                </Link>

                <Link to="/register" className="nav-register">
                    Register
                </Link>
            </>
        )}
    </div>
</nav>


      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-tag">WELCOME TO BLOG APPLICATION</p>

          <h1>
            Ideas That Inspire.
            <br />
            Stories That Matter.
          </h1>

          <p className="hero-description">
            Discover amazing stories, share your knowledge,
            and connect with a community of passionate writers.
          </p>

          <a href="#blogs" className="explore-btn">
            Explore Blogs →
          </a>
        </div>
      </section>

      {/* Blogs Section */}
      <section className="blogs-section" id="blogs">

        <div className="section-heading">
          <div>
            <p className="section-tag">OUR BLOGS</p>
            <h2>Latest Articles</h2>
          </div>

          <button
            className="register-btn"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
                setMessage("");
              }
            }}
          >
            {showForm ? "Close Form" : "+ Create Blog"}
          </button>
        </div>

        {message && (
          <p className="status-message">{message}</p>
        )}

        {/* Create / Edit Form */}
        {showForm && (
          <form className="blog-form" onSubmit={handleSubmit}>

            <h2>
              {editingId ? "Edit Blog" : "Create New Blog"}
            </h2>

            <input
              type="text"
              name="title"
              placeholder="Enter Blog Title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="category"
              placeholder="Enter Category"
              value={formData.category}
              onChange={handleChange}
              required
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />

            <input
              type="text"
              name="author"
              placeholder="Enter Author Name"
              value={formData.author}
              onChange={handleChange}
              required
              disabled={!!editingId}
            />

            <ReactQuill
    theme="snow"
    value={formData.content}
    onChange={(value) =>
        setFormData({
            ...formData,
            content: value
        })
    }
    placeholder="Write your blog content..."
/>

            <button type="submit" className="register-btn">
              {editingId ? "Update Blog" : "Publish Blog"}
            </button>

            <button
              type="button"
              className="login-btn"
              onClick={resetForm}
            >
              Cancel
            </button>

          </form>
        )}

        {/* Blog Listing */}
        {loading && <p>Loading blogs...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && (
          <div className="blog-grid">

            {filteredBlogs.map((blog) => (
              <div className="blog-card" key={blog._id}>
                <img
                  src={
                    blog.imageUrl
                      ? `http://localhost:5000${blog.imageUrl}`
                      : "https://images.unsplash.com/photo-1499750310107-5fef28a66643"
                  }
                  alt={blog.title}
                />

                <div className="blog-content">

                  <span className="category">
                    {blog.category}
                  </span>

                  <h3>{blog.title}</h3>

                  <div
                    className="blog-card-content"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />
                  <Link
                  to={`/blog/${blog._id}`}
                  className="read-more-btn"
                  >
                  Read More →
                  </Link>

                  <div className="blog-footer">
                    <span>{blog.author}</span>

                    <span>
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  
{user && blog.userId === user.id && (
    <div className="blog-actions">
        <button
            className="edit-btn"
            onClick={() => handleEdit(blog)}
        >
            Edit
        </button>

        <button
            className="delete-btn"
            onClick={() => handleDelete(blog._id)}
        >
            Delete
        </button>
    </div>
)}


                </div>
              </div>
            ))}

            {filteredBlogs.length === 0 && (
              <p>No blogs found.</p>
            )}

          </div>
        )}

      </section>

      {/* Footer */}
      <footer id="about">
        <h2>Blog Application<span>.</span></h2>
        <p>Share your ideas. Inspire the world.</p>
        <p>© 2026 Blog Application. All rights reserved.</p>
      </footer>

    </div>
  );
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/blog/:id" element={<BlogDetails />} />
        </Routes>
    );
}

export default App;