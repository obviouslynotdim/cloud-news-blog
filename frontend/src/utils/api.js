import { API_BASE_URL } from '../config/constants';

export function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}
