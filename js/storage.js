// Abstracción simple de localStorage con namespace
const NS = 'simulador-carrito-v1';

function read(key, fallback){
  try{
    const raw = localStorage.getItem(`${NS}:${key}`);
    return raw ? JSON.parse(raw) : fallback;
  }catch(err){
    console.error('Storage read error', err);
    return fallback;
  }
}
function write(key, value){
  try{
    localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
  }catch(err){
    console.error('Storage write error', err);
  }
}
function remove(key){
  localStorage.removeItem(`${NS}:${key}`);
}

export const storage = { read, write, remove };
