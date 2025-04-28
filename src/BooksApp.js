import React, { useState, useRef } from 'react';
import './App.css';

const BooksApp = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [savedBooks, setSavedBooks] = useState([]);
  const [expandedDescription, setExpandedDescription] = useState(null);
  const [feedbackMessages, setFeedbackMessages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const booksPerPage = 5;
  const fileInputRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      const data = await response.json();
      setBooks(data.items || []);
      setCurrentPage(1); // reset to page 1 after new search
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSaveBook = (book, event) => {
    const isBookSaved = savedBooks.some((savedBook) => savedBook.id === book.id);

    if (isBookSaved) {
      setFeedbackMessages((prev) => ({
        ...prev,
        [book.id]: 'Already added to your library!',
      }));
      setTimeout(() => {
        setFeedbackMessages((prev) => {
          const newFeedback = { ...prev };
          delete newFeedback[book.id];
          return newFeedback;
        });
      }, 3000);
      return;
    }

    setSavedBooks((prevBooks) => [
      ...prevBooks,
      {
        id: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail,
      },
    ]);

    setFeedbackMessages((prev) => ({
      ...prev,
      [book.id]: `${book.volumeInfo.title} has been added to your library!`,
    }));

    setTimeout(() => {
      setFeedbackMessages((prev) => {
        const newFeedback = { ...prev };
        delete newFeedback[book.id];
        return newFeedback;
      });
    }, 3000);
  };

  const handleDeleteBook = (bookId) => {
    setSavedBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
  };

  const toggleDescription = (bookId) => {
    setExpandedDescription(expandedDescription === bookId ? null : bookId);
  };

  // Pagination Logic
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  const paginateNext = () => {
    if (indexOfLastBook < books.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const paginatePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">📚 My BookVault</h1>

      <div className="profile-wrapper">
        {profileImage ? (
          <img src={profileImage} alt="Profile" className="profile-image" />
        ) : (
          <div className="profile-placeholder" />
        )}
        <button type="button" className="upload-button" onClick={triggerFileInput}>
          +
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          className="search-input"
          value={query}
          placeholder="Search for books..."
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      <div className="books-list">
        {currentBooks.map((book) => {
          const { title, authors, description, imageLinks } = book.volumeInfo;
          const isExpanded = expandedDescription === book.id;

          return (
            <div key={book.id} className="book-card">
              {imageLinks?.thumbnail && (
                <img
                  src={imageLinks.thumbnail}
                  alt={`${title} cover`}
                  className="book-thumbnail"
                />
              )}
              <div className="book-info">
                <h3>{title}</h3>
                <p className="authors">{authors?.join(', ')}</p>
                {description && (
                  <p className="description">
                    {isExpanded ? description : `${description.substring(0, 200)}...`}
                    <button
                      type="button"
                      className="view-more"
                      onClick={() => toggleDescription(book.id)}
                    >
                      {isExpanded ? 'View Less' : 'View More'}
                    </button>
                  </p>
                )}
                <button
                  type="button"
                  className="save-button"
                  onClick={(e) => handleSaveBook(book, e)}
                >
                  Save
                </button>

                {feedbackMessages[book.id] && (
                  <div className="feedback-message">
                    <p>{feedbackMessages[book.id]}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination buttons */}
      {books.length > 0 && (
        <div className="pagination">
          <button
            onClick={paginatePrev}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Prev
          </button>

          <span className="page-number">Page {currentPage}</span>

          <button
            onClick={paginateNext}
            disabled={indexOfLastBook >= books.length}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}

      <h3>Your Library</h3>
      <div className="library">
        {savedBooks.length > 0 ? (
          <ul>
            {savedBooks.map((book, index) => (
              <li key={index} className="saved-book-card">
                {book.image && (
                  <img src={book.image} alt={`${book.title} cover`} className="book-thumbnail" />
                )}
                <div className="saved-book-info">
                  <h4>{book.title}</h4>
                  <p>{book.authors?.join(', ')}</p>
                  <p className="description">{book.description?.substring(0, 200)}...</p>
                </div>
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => handleDeleteBook(book.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No books saved yet.</p>
        )}
      </div>
    </div>
  );
};

export default BooksApp;
