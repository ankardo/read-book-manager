import React from 'react';
import {
  Segment,
  Grid,
  Pagination,
  Item,
  Card,
  Header,
  Checkbox
} from 'semantic-ui-react';
import logo from '../Books/logo.png';
class BooksList extends React.Component {
  render() {
    return (
      <Segment loading={this.props.isSearching} padded basic>
        <Grid>
          <Grid.Row stretched>
            {!this.props.isSearching && this.props.currentPageBooks && (
              <Card.Group>
                {this.props.currentPageBooks.map(book => {
                  if (
                    (book.title && book.author_name) ||
                    book.isbn ||
                    (book.first_sentence && book.first_sentence.trim !== '') ||
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
                                    <Item.Meta>{book.author_name}</Item.Meta>
                                    <Item.Description>
                                      {book.value && book.value.trim !== '' && (
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
                                              {book.first_sentence.length > 0
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
                                  this.props.readBooks && book
                                    ? this.props.readBooks.find(
                                        readBook => readBook.key === book.key
                                      )
                                      ? true
                                      : false
                                    : false
                                }
                                book={book}
                                onChange={this.props.handleBookCheck}
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
            {this.props.totalPages > 0 && (
              <Pagination
                totalPages={this.props.totalPages}
                activePage={this.props.activePage}
                onPageChange={this.props.handlePaginationChange}
              />
            )}
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}
export default BooksList;
