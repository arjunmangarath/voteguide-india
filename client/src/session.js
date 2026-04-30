import { v4 as uuidv4 } from 'uuid';

const KEY = 'vg_session_id';

export function getSessionId() {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function sessionHeaders() {
  return { 'x-session-id': getSessionId() };
}
