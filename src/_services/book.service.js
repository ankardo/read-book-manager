import { BehaviorSubject } from 'rxjs';
import { authenticationService } from './authentication.service';

let database;
let readBooksList = [];
const setDatabaseValue = value => {
  database = value;
};
const addBookToDatabase = book => {
  const key = book.key;
  const isbn = book.isbn[0];
  const first_sentence = book.first_sentence;
  const cover_i = book.cover_i;
  const title = book.title;
  const author_key = book.author_key;
  const author_name = book.author_name;
  const userEmail = authenticationService.currentUserValue.email;

  database.transaction('rw', database.readBooks, async () => {
    const hasAlreadyRegistered = await database.readBooks
      .where('key')
      .equals(key)
      .first();
    if (!hasAlreadyRegistered) {
      await database.readBooks
        .put({
          key,
          isbn,
          first_sentence,
          cover_i,
          title,
          author_key,
          author_name,
          userEmail
        })
        .then(book => {
          readBooksList = [...readBooksList, book];
          readBooksSubject.next(readBooksList);
        })
        .catch(error => console.error(error.stack || error));
    }
  });
};
const removeBookFromDatabase = book => {
  database.transaction('rw', database.readBooks, async () => {
    const bookToRemove = await database.readBooks
      .where('key')
      .equals(book.key)
      .first();
    if (bookToRemove) {
      await database.readBooks.delete(bookToRemove.id);
      readBooksList = readBooksList.filter(
        bookFromList => bookFromList.Id !== bookToRemove.id
      );
      readBooksSubject.next(readBooksList);
    }
  });
};
const refreshReadBooks = async () => {
  database.transaction('r', database.readBooks, async () => {
    readBooksList = await database.readBooks
      .toArray()
      .catch(error => console.error(error.stack || error));
    readBooksSubject.next(readBooksList);
  });
};

const readBooksSubject = new BehaviorSubject(
  readBooksList.length > 0 ? JSON.parse(readBooksList) : null
);

export const bookService = {
  setDatabaseValue,
  addBookToDatabase,
  removeBookFromDatabase,
  refreshReadBooks,
  readBooks: readBooksSubject.asObservable(),

  get currentReadBooksValue() {
    return readBooksSubject.value;
  }
};
