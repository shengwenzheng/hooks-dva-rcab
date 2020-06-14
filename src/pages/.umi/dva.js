import dva from 'dva';
import { Component } from 'react';
import createLoading from 'dva-loading';
import history from '@tmp/history';

let app = null;

export function _onCreate() {
  const plugins = require('umi/_runtimePlugin');
  const runtimeDva = plugins.mergeConfig('dva');
  app = dva({
    history,
    
    ...(runtimeDva.config || {}),
    ...(window.g_useSSR ? { initialState: window.g_initialData } : {}),
  });
  
  app.use(createLoading());
  (runtimeDva.plugins || []).forEach(plugin => {
    app.use(plugin);
  });
  
  app.model({ namespace: 'deploy', ...(require('D:/daily-secure-front/src/models/deploy.js').default) });
app.model({ namespace: 'fight', ...(require('D:/daily-secure-front/src/models/fight.js').default) });
app.model({ namespace: 'map', ...(require('D:/daily-secure-front/src/models/map.js').default) });
app.model({ namespace: 'policeSentiment', ...(require('D:/daily-secure-front/src/models/policeSentiment.js').default) });
  return app;
}

export function getApp() {
  return app;
}

export class _DvaContainer extends Component {
  render() {
    const app = getApp();
    app.router(() => this.props.children);
    return app.start()();
  }
}
