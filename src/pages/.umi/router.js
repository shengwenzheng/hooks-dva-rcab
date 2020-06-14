import React from 'react';
import {
  Router as DefaultRouter,
  Route,
  Switch,
  StaticRouter,
} from 'react-router-dom';
import dynamic from 'umi/dynamic';
import renderRoutes from 'umi/lib/renderRoutes';
import history from '@@/history';
import RendererWrapper0 from 'D:/daily-secure-front/src/pages/.umi/LocaleWrapper.jsx';
import { routerRedux } from 'dva';

const Router = routerRedux.ConnectedRouter;

const routes = [
  {
    path: '/',
    redirect: '/deploy',
    exact: true,
    _title: '日常安保',
    _title_default: '日常安保',
  },
  {
    path: '/',
    component: require('../../layouts').default,
    routes: [
      {
        path: '/deploy',
        component: require('../deploy').default,
        exact: true,
        _title: '日常安保',
        _title_default: '日常安保',
      },
      {
        path: '/fight',
        component: require('../fight').default,
        routes: [
          {
            path: '/fight/135',
            component: require('../otf').default,
            exact: true,
            _title: '日常安保',
            _title_default: '日常安保',
          },
          {
            path: '/fight/alarm',
            component: require('../PoliceSentiment').default,
            exact: true,
            _title: '日常安保',
            _title_default: '日常安保',
          },
          {
            component: () =>
              React.createElement(
                require('D:/daily-secure-front/node_modules/_umi-build-dev@1.17.1@umi-build-dev/lib/plugins/404/NotFound.js')
                  .default,
                { pagesPath: 'src/pages', hasRoutesInConfig: true },
              ),
            _title: '日常安保',
            _title_default: '日常安保',
          },
        ],
        _title: '日常安保',
        _title_default: '日常安保',
      },
      {
        component: () =>
          React.createElement(
            require('D:/daily-secure-front/node_modules/_umi-build-dev@1.17.1@umi-build-dev/lib/plugins/404/NotFound.js')
              .default,
            { pagesPath: 'src/pages', hasRoutesInConfig: true },
          ),
        _title: '日常安保',
        _title_default: '日常安保',
      },
    ],
    _title: '日常安保',
    _title_default: '日常安保',
  },
  {
    component: () =>
      React.createElement(
        require('D:/daily-secure-front/node_modules/_umi-build-dev@1.17.1@umi-build-dev/lib/plugins/404/NotFound.js')
          .default,
        { pagesPath: 'src/pages', hasRoutesInConfig: true },
      ),
    _title: '日常安保',
    _title_default: '日常安保',
  },
];
window.g_routes = routes;
const plugins = require('umi/_runtimePlugin');
plugins.applyForEach('patchRoutes', { initialValue: routes });

export { routes };

export default class RouterWrapper extends React.Component {
  unListen() {}

  constructor(props) {
    super(props);

    // route change handler
    function routeChangeHandler(location, action) {
      plugins.applyForEach('onRouteChange', {
        initialValue: {
          routes,
          location,
          action,
        },
      });
    }
    this.unListen = history.listen(routeChangeHandler);
    // dva 中 history.listen 会初始执行一次
    // 这里排除掉 dva 的场景，可以避免 onRouteChange 在启用 dva 后的初始加载时被多执行一次
    const isDva =
      history.listen
        .toString()
        .indexOf('callback(history.location, history.action)') > -1;
    if (!isDva) {
      routeChangeHandler(history.location);
    }
  }

  componentWillUnmount() {
    this.unListen();
  }

  render() {
    const props = this.props || {};
    return (
      <RendererWrapper0>
        <Router history={history}>{renderRoutes(routes, props)}</Router>
      </RendererWrapper0>
    );
  }
}
