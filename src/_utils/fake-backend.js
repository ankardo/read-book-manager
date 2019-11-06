export function configureFakeBackend(database) {
  database.open().catch(function(e) {
    console.error('Open failed: ' + e.stack);
  });

  database.transaction('r', database.users, async () => {
    const users = await database.users.toArray();
    let realFetch = window.fetch;
    window.fetch = function(url, opts) {
      const isLoggedIn =
        opts.headers['Authorization'] === 'Bearer fake-jwt-token';

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (url.endsWith('/users/authenticate') && opts.method === 'POST') {
            const params = JSON.parse(opts.body);
            const user = users.find(
              user => user.email === params.email && user.password === params.password
            );
            if (!user) return error('email or password is incorrect');
            return ok({
              id: user.id,
              email: user.email,
              name: user.name,
              token: 'fake-jwt-token'
            });
          }

          // get users - secure
          if (url.endsWith('/users') && opts.method === 'GET') {
            if (!isLoggedIn) return unauthorized();
            return ok(users);
          }

          // pass through any requests not handled above
          realFetch(url, opts).then(response => resolve(response));

          // private helper functions

          function ok(body) {
            resolve({
              ok: true,
              text: () => Promise.resolve(JSON.stringify(body))
            });
          }

          function unauthorized() {
            resolve({
              status: 401,
              text: () =>
                Promise.resolve(JSON.stringify({ message: 'Unauthorized' }))
            });
          }

          function error(message) {
            resolve({
              status: 400,
              text: () => Promise.resolve(JSON.stringify({ message }))
            });
          }
        }, 500);
      });
    };
  });
}
