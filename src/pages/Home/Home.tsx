import React, { useMemo } from 'react';

import { SceneApp, SceneAppPage } from '@grafana/scenes';
import { getBasicScene } from './scenes';
import { prefixRoute } from '../../utils/utils.routing';
import { DATASOURCE_REF, ROUTES } from '../../constants';
import { config } from '@grafana/runtime';
import { Alert } from '@grafana/ui';
import { DataSourceInstanceSettings } from '@grafana/data';

function hasLoggingDataSources(dataSources: Record<string, DataSourceInstanceSettings>) {
 	return Object.entries(dataSources).some(([_, ds]) => ds.type === 'loki');
}

const getScene = () => {
  return new SceneApp({
    pages: [
      new SceneAppPage({
        title: 'Logs App',
        subTitle:
          'This scene showcases a basic scene functionality, including query runner, variable and a custom scene object.',
        url: prefixRoute(ROUTES.Home),
        getScene: () => {
          return getBasicScene();
        },
      }),
    ],
  });
};
export const HomePage = () => {
  const scene = useMemo(() => getScene(), []);
  const hasDataSources = useMemo(() => hasLoggingDataSources(config.datasources), []);

  return (
    <>
        {!hasDataSources && (
        <Alert title={`Missing logging data sources`}>
                This plugin requires a Loki data source. Please add and configure a Loki data source to your Grafana instance.
        </Alert>
        )}  

      <scene.Component model={scene} />
    </>
  );
};
