import React, { useState, useEffect } from 'react';
import initialDb from '../db.json';

export default function App() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewBlog, setViewBlog] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [image, setImage] = useState('');
  const [video, setVideo] = useState('');
  const [content, setContent] = useState('');

  // Fetch blogs (REST API simulation with db.json & localStorage)
  useEffect(() => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      try {
        const saved = localStorage.getItem('blog_app_data');
        if (saved) {
          setBlogs(JSON.parse(saved));
        } else {
          setBlogs(initialDb.blogs);
          localStorage.setItem('blog_app_data', JSON.stringify(initialDb.blogs));
        }
      } catch (err) {
        setError('Failed to fetch blog posts from API server.');
      } finally {
        setLoading(false);
      }
    }, 600);
  }, []);

  const saveToStorage = (updatedBlogs) => {
    setBlogs(updatedBlogs);
    localStorage.setItem('blog_app_data', JSON.stringify(updatedBlogs));
  };

  const getWordCount = (text) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const wordCount = getWordCount(content);

  const handleOpenAdd = () => {
    setEditingBlog(null);
    setTitle('');
    setAuthor('Mita Kar');
    setImage('https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80');
    setVideo('');
    setContent('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setAuthor(blog.author);
    setImage(blog.image);
    setVideo(blog.video || '');
    setContent(blog.content);
    setIsFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (wordCount > 1000) {
      alert('Content exceeds the maximum limit of 1000 words!');
      return;
    }

    if (editingBlog) {
      const updated = blogs.map(b => b.id === editingBlog.id ? {
        ...b,
        title,
        author,
        image,
        video,
        content
      } : b);
      saveToStorage(updated);
    } else {
      const newBlog = {
        id: Date.now().toString(),
        title,
        author,
        date: new Date().toISOString().split('T')[0],
        image: image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
        video,
        content
      };
      saveToStorage([newBlog, ...blogs]);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      saveToStorage(blogs.filter(b => b.id !== id));
      if (viewBlog && viewBlog.id === id) setViewBlog(null);
    }
  };

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="blog-app">
      <div className="top-bar">
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ec4899' }}>📝 Tech & Coding Blog</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>CRUD / REST API / Axios Assignment with 1000-Word Limit</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>+ Create Blog Post</button>
      </div>

      <input 
        type="text" 
        placeholder="🔍 Search blog posts by keyword..." 
        className="search-input" 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
      />

      {error && <div style={{ padding: '14px', background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '10px', marginBottom: '20px' }}>{error}</div>}

      {loading ? (
        <div className="spinner"></div>
      ) : filteredBlogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', background: '#131c2e', borderRadius: '14px' }}>
          <h3>No blogs available.</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Try searching with a different keyword or create a new blog post.</p>
        </div>
      ) : (
        <div className="blogs-grid">
          {filteredBlogs.map(blog => (
            <div key={blog.id} className="blog-card">
              <div>
                <img src={blog.image} alt={blog.title} className="blog-img" />
                <div className="blog-body">
                  <div style={{ fontSize: '0.8rem', color: '#ec4899', fontWeight: 600, marginBottom: '6px' }}>
                    By {blog.author} • {blog.date}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px' }}>{blog.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {blog.content}
                  </p>
                </div>
              </div>

              <div style={{ padding: '0 20px 20px', display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }} onClick={() => setViewBlog(blog)}>Read Post</button>
                <button className="btn" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #3b82f6', fontSize: '0.85rem' }} onClick={() => handleOpenEdit(blog)}>Edit</button>
                <button className="btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #ef4444', fontSize: '0.85rem' }} onClick={() => handleDelete(blog.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Blog Modal */}
      {viewBlog && (
        <div className="modal-overlay" onClick={() => setViewBlog(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={viewBlog.image} alt={viewBlog.title} style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '10px', marginBottom: '16px' }} />
            <div style={{ fontSize: '0.85rem', color: '#ec4899', fontWeight: 600 }}>
              By {viewBlog.author} • {viewBlog.date} • {getWordCount(viewBlog.content)} words
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '10px 0 16px' }}>{viewBlog.title}</h2>
            
            {viewBlog.video && (
              <div style={{ margin: '16px 0' }}>
                <iframe 
                  width="100%" 
                  height="280" 
                  src={viewBlog.video} 
                  title="Blog Video" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                  style={{ borderRadius: '10px' }}
                ></iframe>
              </div>
            )}

            <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {viewBlog.content}
            </p>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setViewBlog(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }}>
              {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>

            <form onSubmit={handleSubmit}>
              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Title</label>
              <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />

              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Author Name</label>
              <input type="text" className="form-input" value={author} onChange={e => setAuthor(e.target.value)} required />

              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Header Image URL</label>
              <input type="url" className="form-input" value={image} onChange={e => setImage(e.target.value)} required />

              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Embedded Video URL (Optional)</label>
              <input type="url" className="form-input" placeholder="e.g. https://www.youtube.com/embed/..." value={video} onChange={e => setVideo(e.target.value)} />

              <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Blog Content (Max 1000 words)</label>
              <textarea 
                className="form-input" 
                rows="8" 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                required 
              />
              <div className="word-count" style={{ color: wordCount > 1000 ? '#ef4444' : '#94a3b8' }}>
                Word Count: {wordCount} / 1000 words {wordCount > 1000 && '(Limit Exceeded!)'}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn" style={{ background: '#1e293b', color: 'white' }} onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingBlog ? 'Update Post' : 'Publish Blog'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
