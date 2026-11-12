import { useStore } from '@nanostores/react';

import { useApiList } from '../hooks/useApiList';
import { bookService } from '../services/book.service';
import { favourites } from '../stores/favourites';
import { formatPrice, languageName } from '../utils/format';
import { FavouriteButton } from './FavouriteButton';

export function FavouritesList() {
  const { items: books, loading, error } = useApiList(bookService.getBooks);
  const ids = useStore(favourites);

  const favouriteBooks = books.filter((book) => ids.includes(book._id));

  return (
    <>
      <div className="page-header">
        <h1>Favoritos</h1>
      </div>

      {error && <p className="alert">{error}</p>}

      {loading && <p className="muted">Cargando...</p>}

      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Título</th>
              <th>Autores</th>
              <th>Idioma</th>
              <th>Año</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {favouriteBooks.map((book) => (
              <tr key={book._id}>
                <td>
                  <FavouriteButton bookId={book._id} />
                </td>
                <td>{book.title}</td>
                <td>
                  {book.authors.length > 0 ? (
                    book.authors.map((author) => author.name).join(', ')
                  ) : (
                    <span className="muted">Sin autores</span>
                  )}
                </td>
                <td>{languageName(book.language)}</td>
                <td>{book.publishedYear}</td>
                <td>{formatPrice(book.price)}</td>
              </tr>
            ))}
            {favouriteBooks.length === 0 && (
              <tr>
                <td className="empty" colSpan={6}>
                  No hay libros favoritos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </>
  );
}
