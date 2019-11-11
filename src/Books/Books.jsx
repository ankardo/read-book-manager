import React from 'react';
import { Input, Segment, Dropdown, Grid, Checkbox } from 'semantic-ui-react';

import { MContext } from '../_configuration/Context';
import { bookService } from '../_services/book.service';
import InfoModal from '../_utils/InfoModal';
import BooksList from './BooksList';
import moment from 'moment';
import withUnmounted from '@ishawnwang/withunmounted'

class Books extends React.Component {
  static contextType = MContext;
  state = {
    isSearching: false,
    searchUrl: '',
    searchValue: '',
    totalPages: 0,
    activePage: 1,
    showReadBooks: false,
    hasError: false,
    errorType: '',
    errorMessage: '',
    currentPageBooks: []
  };
  options = [
    { key: 'title', text: 'Title', value: 'Title' },
    { key: 'author', text: 'Author', value: 'Author' },
    { key: 'subject', text: 'Subject', value: 'Subject' }
  ];
  componentDidMount() {
    if (this.hasUnmounted) {
      return;
    }
    bookService.readBooks.subscribe(readBooks => this.setState({ readBooks }));
    bookService.setDatabaseValue(this.context.state.database);
    bookService.refreshReadBooks();
  }

  getBookDetailsData = docs => {
    return Promise.all(
      docs.map(async doc => {
        const olid = `OLID${doc.cover_edition_key}`;
        const bookRequest = await fetch(
          `https://openlibrary.org/api/books?&bibkeys=${olid}&jscmd=details&format=json`
        );
        const bookJson = await bookRequest.json();

        return Object.assign(
          {},
          doc,
          { readDate: moment().format('DD-MM-YYYY') },
          bookJson[olid] &&
            bookJson[olid].details &&
            bookJson[olid].details.description
            ? bookJson[olid].details.description
            : {}
        );
      })
    );
  };
  handleFetch = url => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        this.getBookDetailsData(data.docs)
          .then(books => {
            this.setState({
              currentPageBooks: books,
              isSearching: false,
              totalPages: Math.ceil(data.numFound / 100)
            });
          })
          .catch(error => {
            console.error(error.stack || error);
            this.setState({
              isSearching: false
            });
          });
      })
      .catch(error => {
        this.setState({ isSearching: false });
        console.error(error.stack || error);
      });
  };

  handleSearchClick = () => {
    if (this.state.searchString && this.state.searchString.trim !== '') {
      this.setState({ isSearching: true });
      if (this.state.searchUrl === '') {
        this.setState(
          {
            searchUrl: 'http://openlibrary.org/search.json?title=',
            searchValue: this.state.searchString.replace(' ', '+') + '&page='
          },
          () =>
            this.handleFetch(
              this.state.searchUrl +
              this.state.searchValue +
              this.state.activePage
            )
        );
      } else {
        this.setState(
          {
            searchUrl: this.state.searchUrl,
            searchValue: this.state.searchString.replace(' ', '+') + '&page='
          },
          () =>
            this.handleFetch(
              this.state.searchUrl +
              this.state.searchValue +
              this.state.activePage
            )
        );
      }
    } else {
      this.setState({
        hasError: true,
        errorType: "Couldn't Search Books",
        errorMessage: 'You should type something to search!'
      });
    }
  };
  handleOptionChange = (e, { value }) => {
    switch (value) {
      case 'Title':
        this.setState({
          searchUrl: 'http://openlibrary.org/search.json?title='
        });
        break;
      case 'Author':
        this.setState({
          searchUrl: 'http://openlibrary.org/search.json?author='
        });
        break;
      case 'Subject':
        this.setState({
          searchUrl: 'http://openlibrary.org/search.json?subject='
        });
        break;
      default:
        break;
    }
  };
  handleShowReadBooks = (e, { checked }) => {
    bookService
      .refreshReadBooks()
      .then(() => {
        if (this.state.readBooks) {
          const numRecords = this.state.readBooks.length;
          if (checked === true && numRecords > 0) {
            this.setState(
              {
                totalPages: Math.ceil(numRecords / 100),
                activePage: 1
              },
              () => this.setState({ currentPageBooks: this.state.readBooks.sort((a, b) => a.readDate > b.readDate ? -1 : a.readDate < b.readDate ? 1 : 0) })
            );
          } else {
            this.setState({ totalPages: 0, currentPageBooks: [] });
          }
        }
      })
      .catch(error => console.error(error.stack || error));
    if (!checked) {
      this.setState({ showReadBooks: false });
      if (this.state.searchString && this.state.searchString.trim !== '') {
        this.handleSearchClick();
      } else {
        this.setState({ totalPages: 0, currentPageBooks: [] });
      }
    } else {
      this.setState({ showReadBooks: true });
    }
  };

  handleBookCheck = (e, { book, checked }) => {
    if (checked === true) {
      bookService.addBookToDatabase(book);
    } else {
      bookService.removeBookFromDatabase(book);
    }
    bookService.refreshReadBooks();
  };

  handlePaginationChange = (e, { activePage }) => {
    if (this.state.showReadBooks) {
      this.setState({ currentPageBooks: this.state.readBooks.slice(0 + (100 * activePage - 1), 100 * activePage), activePage: activePage })
    } else {
      this.setState({ isSearching: true, activePage: activePage }, () =>
        this.handleFetch(
          this.state.searchUrl + this.state.searchValue + this.state.activePage
        )
      );
    }
  };

  render() {
    return (
      <React.Fragment>
        <InfoModal
          open={this.state.hasError}
          messageType={this.state.errorType}
          message={this.state.errorMessage}
          onClick={() =>
            this.setState({
              hasError: false,
              errorType: '',
              errorMessage: ''
            })
          }
        />
        <Segment padded="very">
          <Grid>
            <Grid.Row>
              <Input
                onChange={e => this.setState({ searchString: e.target.value })}
                disabled={this.state.showReadBooks}
                loading={this.state.isSearching}
                action={{
                  icon: 'search',
                  disabled: this.state.showReadBooks,
                  onClick: this.handleSearchClick
                }}
                labelPosition="left"
                label={
                  <Dropdown
                    defaultValue="Title"
                    onChange={this.handleOptionChange}
                    disabled={this.state.showReadBooks}
                    options={this.options}
                  />
                }
                placeholder="Search Books"
              />
            </Grid.Row>
            <Grid.Row>
              <Checkbox
                toggle
                label="Books That I Read"
                onChange={this.handleShowReadBooks}
              />
            </Grid.Row>
          </Grid>
        </Segment>
        {(this.state.isSearching || this.state.totalPages > 0) && (
          <BooksList
            isSearching={this.state.isSearching}
            currentPageBooks={this.state.currentPageBooks}
            readBooks={this.state.readBooks}
            totalPages={this.state.totalPages}
            activePage={this.state.activePage}
            dateDisabled={this.state.showReadBooks}
            showBookCheck={true}
            handleBookCheck={this.handleBookCheck}
            handlePaginationChange={this.handlePaginationChange}
          />
        )}
      </React.Fragment>
    );
  }
}
export default withUnmounted(Books);
