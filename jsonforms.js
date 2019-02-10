import { combineReducers, createStore } from 'redux';
import { Provider } from 'react-redux';

import { Actions, jsonformsReducer } from '@jsonforms/core';
import { person } from '@jsonforms/examples';
import { materialFields, materialRenderers } from '@jsonforms/material-renderers';

const schema = person.schema;
const uischema = person.uischema
const data = person.data;

const store = createStore(
  combineReducers({ jsonforms: jsonformsReducer() }),  
  {
    jsonforms: {
      renderers: materialRenderers,
      fields: materialFields,
    }
  }
);

store.dispatch(Actions.init(data, schema, uischema));