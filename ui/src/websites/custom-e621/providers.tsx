import Axios from 'axios';
import { getBaseE621Url } from '../../utils';

export const customE621TagSearchProvider = (value: string) => {
  return Axios.get(`${getBaseE621Url()}/tags/autocomplete.json?`, {
    params: {
      expiry: '7',
      'search[name_matches]': value,
    },
  })
    .then(({ data }) => (data || []).map(d => d.name))
    .catch(err => {
      console.error(err);
      return [];
    });
};
