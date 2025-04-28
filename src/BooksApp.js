import React, { useState, useRef } from 'react';
import './App.css';

const BooksApp = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [savedBooks, setSavedBooks] = useState([]);
  const [expandedDescription, setExpandedDescription] = useState(null);
  const [feedbackMessages, setFeedbackMessages] = useState({});
  const fileInputRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    setBooks(data.items || []);
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
      // Show feedback message that the book is already added
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
      }, 3000); // Clear the message after 3 seconds
      return;
    }

    // Save the book to the library
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

    // Show feedback message when a book is saved
    setFeedbackMessages((prev) => ({
      ...prev,
      [book.id]: `${book.volumeInfo.title} has been added to your library!`,
    }));

    // Clear the feedback message after 3 seconds
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
        {books.map((book) => {
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
                    <button className="view-more" onClick={() => toggleDescription(book.id)}>
                      {isExpanded ? 'View Less' : 'View More'}
                    </button>
                  </p>
                )}
                <button
                  className="save-button"
                  onClick={(e) => handleSaveBook(book, e)} // Pass the event to handleSaveBook
                >
                  Save
                </button>

                {/* Display feedback message near the save button */}
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

      <h3>Your Library</h3>
      <div className="library">
        {savedBooks.length > 0 ? (
          <ul>
            {savedBooks.map((book, index) => (
              <li key={index} className="saved-book-card">
                {book.image && <img src={book.image} alt={`${book.title} cover`} className="book-thumbnail" />}
                <div className="saved-book-info">
                  <h4>{book.title}</h4>
                  <p>{book.authors?.join(', ')}</p>
                  <p className="description">{book.description?.substring(0, 200)}...</p>
                </div>
                {/* Delete button in the library */}
                <button
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
