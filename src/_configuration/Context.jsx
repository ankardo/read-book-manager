import React, { Component } from 'react';
import Dexie from 'dexie';

const initialState = {
  database: {},
  isAuthenticated: false
};

export const MContext = React.createContext(initialState);

const createStore = () => {
  const database = new Dexie('readBooksDatabase');
  database.version(1).stores({
    users: '++id,name,email,password,[name+email]',
    books: '++id,name,kind'
  });
  return database;
};

class MProvider extends Component {
  state = { database: createStore(), isAuthenticated: false, userName:'' };
  render() {
    return (
      <MContext.Provider
        value={{
          state: this.state,
          setAuthStatus: (status,name) =>
            this.setState({
              isAuthenticated: status,
              userName: name
            })
        }}
      >
        {this.props.children}
      </MContext.Provider>
    );
  }
}

export default MProvider;
