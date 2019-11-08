import React from 'react';
import {
  Input,
  Segment,
  Dropdown,
  Grid,
  Pagination,
  Item,
  Card,
  Header,
  Checkbox
} from 'semantic-ui-react';
import logo from '../Books/logo.png';
import { MContext } from '../_configuration/Context';
import { bookService } from '../_services/book.service';
import InfoModal from '../_utils/InfoModal';

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
            console.log(books);
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
              () => this.setState({ currentPageBooks: this.state.readBooks })
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
        this.currentPageBooks = [];
        this.setState({ totalPages: 0 });
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
    this.setState({ isSearching: true, activePage: activePage }, () =>
      this.handleFetch(
        this.state.searchUrl + this.state.searchValue + this.state.activePage
      )
    );
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
        <Segment padded>
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
          <Segment loading={this.state.isSearching} padded>
            <Grid>
              <Grid.Row stretched>
                {!this.state.isSearching && this.state.currentPageBooks && (
                  <Card.Group>
                    {this.state.currentPageBooks.map(book => {
                      if (
                        (book.title && book.author_name) ||
                        book.isbn ||
                        (book.first_sentence &&
                          book.first_sentence.trim !== '') ||
                        (book.value && book.value.trim !== '')
                      ) {
                        return (
                          <Card fluid key={book.key}>
                            <Card.Content>
                              <Grid container textAlign="justified">
                                <Grid.Row columns="equal">
                                  <Grid.Column>
                                    {book.cover_i ? (
                                      <Item.Image
                                        size="medium"
                                        src={`http://covers.openlibrary.org/b/ID/${book.cover_i}-M.jpg`}
                                      />
                                    ) : (
                                      <Item.Image size="small" src={logo} />
                                    )}
                                  </Grid.Column>
                                  <Grid.Column floated="left">
                                    <Card.Header>
                                      <Header>{book.title}</Header>
                                    </Card.Header>
                                    <Item>
                                      <Item.Content>
                                        <Item.Meta>
                                          {book.author_name}
                                        </Item.Meta>
                                        <Item.Description>
                                          {book.value &&
                                            book.value.trim !== '' && (
                                              <React.Fragment>
                                                <p>{book.value}</p>
                                              </React.Fragment>
                                            )}
                                          {!(
                                            book.value && book.value.trim !== ''
                                          ) &&
                                            book.first_sentence &&
                                            book.first_sentence.trim !== '' && (
                                              <React.Fragment>
                                                <p>
                                                  {book.first_sentence.length >
                                                  0
                                                    ? book.first_sentence[0]
                                                    : book.first_sentence}
                                                </p>
                                              </React.Fragment>
                                            )}
                                        </Item.Description>
                                        <Item.Extra>
                                          {book.isbn && book.isbn[0] && (
                                            <a
                                              href={`http://openlibrary.org/isbn/${
                                                book.isbn[0]
                                              }`}
                                            >
                                              See book on Openlibrary
                                            </a>
                                          )}
                                        </Item.Extra>
                                      </Item.Content>
                                    </Item>
                                  </Grid.Column>
                                  <Grid.Column>
                                    {book.author_key && (
                                      <Grid>
                                        <Grid.Row centered>
                                          <Item.Image
                                            size="medium"
                                            src={`http://covers.openlibrary.org/a/OLID/${book.author_key}-M.jpg`}
                                          />
                                        </Grid.Row>
                                        <Grid.Row centered>
                                          <Header>{book.author_name}</Header>
                                        </Grid.Row>
                                      </Grid>
                                    )}
                                  </Grid.Column>
                                </Grid.Row>
                              </Grid>
                            </Card.Content>
                            <Card.Content extra>
                              <Grid>
                                <Grid.Row centered>
                                  <Checkbox
                                    toggle
                                    label="Read"
                                    checked={
                                      this.state.readBooks && book
                                        ? this.state.readBooks.find(
                                            readBook =>
                                              readBook.key === book.key
                                          )
                                          ? true
                                          : false
                                        : false
                                    }
                                    book={book}
                                    onChange={this.handleBookCheck}
                                  />
                                </Grid.Row>
                              </Grid>
                            </Card.Content>
                          </Card>
                        );
                      } else return '';
                    })}
                  </Card.Group>
                )}
              </Grid.Row>
              <Grid.Row centered>
                {this.state.totalPages > 0 && (
                  <Pagination
                    totalPages={this.state.totalPages}
                    activePage={this.state.activePage}
                    onPageChange={this.handlePaginationChange}
                  />
                )}
              </Grid.Row>
            </Grid>
          </Segment>
        )}
      </React.Fragment>
    );
  }
}
export default Books;
