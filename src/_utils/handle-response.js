import { authenticationService } from '../_services/authentication.service';

export function handleResponse(response) {
  return response.text().then(text => {
    if (text) {
      const data = text && JSON.parse(text);
      console.log(data);
      if (!response.ok) {
        if ([401, 403].indexOf(response.status) !== -1) {
          authenticationService.logout();
        }

        const error = (data && data.message) || response.statusText;
        return Promise.reject(error);
      }

      return data;
    }
  });
}
