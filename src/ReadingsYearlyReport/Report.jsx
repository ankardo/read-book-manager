import React from "react";
import { Segment, Dropdown, Grid } from 'semantic-ui-react';
import { MContext } from '../_configuration/Context';
import { bookService } from '../_services/book.service';
import BooksList from "../Books/BooksList";
import moment from "moment";
import withUnmounted from '@ishawnwang/withunmounted'

class Report extends React.Component {

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
    currentPageBooks: [],
    availableYears: [],
    lastAvailableYear: { text: 'No read books', value: 0 }
  };
  componentDidMount() {
    if (this.hasUnmounted) {
      return;
    }
    bookService.readBooks.subscribe(readBooks => this.setState({ readBooks }));
    bookService.setDatabaseValue(this.context.state.database);
    this.getYearsWithReadBooks();
  }
  removeDuplicates(array, key) {
    return array.filter((object, index, self) =>
      index === self.findIndex((element) => (
        element[key] === object[key]
      ))
    )
  }
  getYearsWithReadBooks = () => {
    bookService
      .refreshReadBooks()
      .then(() => {
        if (this.state.readBooks) {
          const yearsWithReadBooks = this.state.readBooks.map(({ readDateIso }) => {
            return { text: moment(readDateIso).year().toString(), value: moment(readDateIso).year() }
          });
          const availableYears = this.removeDuplicates(yearsWithReadBooks,'value');
          this.setState({ availableYears }, () => {
            if (yearsWithReadBooks[0] && yearsWithReadBooks[0].value) {
              const lastAvailableYear = yearsWithReadBooks.reduce(
                (lastYear, year) => (year.value > lastYear.value ? year : lastYear), yearsWithReadBooks[0]
              );
              this.setState({ lastAvailableYear }, () => this.showYearReadBooks(this.state.lastAvailableYear.value));
            }
          });
        }

      })
  }
  showYearReadBooks = (year) => {
    bookService
      .refreshReadBooks()
      .then(() => {
        if (this.state.readBooks) {
          const readBooksOfTheYear = this.state.readBooks.filter(
            book => moment(book.readDateIso).year() === year
          );
          const numRecords = readBooksOfTheYear.length;
          if (numRecords > 0) {
            this.setState(
              {
                totalPages: Math.ceil(numRecords / 100),
                activePage: 1
              },
              () => {
                const currentPageBooks = readBooksOfTheYear.slice(0, 100)
                  .sort((a,b) => a.readDate > b.readDate ? -1 : a.readDate < b.readDate ? 1 : 0);
                return this.setState({ currentPageBooks });
              }
            );
          } else {
            this.setState({ totalPages: 0, currentPageBooks: [] });
          }
        }
      })
      .catch(error => console.error(error.stack || error));
  };
  handleYearChange = (e, { value }) => {
    this.setState({ lastAvailableYear: { text: value.toString(), value } }, this.showYearReadBooks(value));
  }
  handlePaginationChange = (e, { activePage }) => {
    this.setState({ currentPageBooks: this.state.currentPageBooks.slice(0 + (100 * activePage - 1), 100 * activePage), activePage: activePage })
  }
  render() {

    return (
      <React.Fragment>
        <Segment>
          <Grid>
            <Grid.Row centered>
              <Dropdown
                options={this.state.availableYears}
                value={this.state.lastAvailableYear.value}
                onChange={this.handleYearChange}
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
            dateDisabled={true}
            showBookCheck={false}
            handlePaginationChange={this.handlePaginationChange}
          />
        )}
      </React.Fragment >
    );
  }
}

export default withUnmounted(Report);