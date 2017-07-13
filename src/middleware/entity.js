
import shortid from 'shortid';

export const entityMiddleware = (store) => (next) => ({type, ...rest}) => {
  if (type !== 'SpawnEntity') {
    return next({type, ...rest});
  }
  const id = shortid();
  return next(store.dispatch({type: 'Entity/Create', id, ...rest}));
};
