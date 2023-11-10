import {
  EmbeddedScene,
  PanelBuilders,
  SceneControlsSpacer,
  SceneGridLayout,
  SceneGridItem,
  SceneQueryRunner,
  SceneTimePicker,
  SceneTimeRange,
  SceneVariableSet,
  VariableValueSelectors,
  DataSourceVariable,
  QueryVariable,
  TextBoxVariable,
} from '@grafana/scenes';
import { BigValueGraphMode } from '@grafana/schema';


export function getBasicScene(templatised = true, seriesToShow = '__server_names') {
  const timeRange = new SceneTimeRange({
    from: 'now-1h',
    to: 'now',
  });

  const dsHandler = new DataSourceVariable({
	label: 'Data source',
	name: 'ds', // being $ds the name of the variable holding UID value of the selected data source
	pluginId: 'loki'
  });

  const streamHandler = new QueryVariable({
	label: 'Source stream',
	name: 'stream_name', // $stream_name will hold the selected stream
	datasource: {
  		type: 'loki',
  		uid: '$ds' // here the value of $ds selected in the DataSourceVariable will be interpolated.
	},
	query: 'label_names()',
  });

  const streamValueHandler = new TextBoxVariable({
	label: 'Stream value',
	name: 'stream_value', // $stream_value will hold the user input
  });

    const timeSeriesQueryRunner = new SceneQueryRunner({
        datasource: {
            type: 'loki',
            uid: '$ds',
        },
        queries: [
            {
                refId: 'B',
                expr: 'count_over_time({$stream_name="$stream_value"} [$__interval])',
            },
        ],
    });
    
    const timeSeriesPanel = PanelBuilders
    .timeseries()
    .setTitle('Logs over time')
    .setData(timeSeriesQueryRunner);

    const logsQueryRunner = new SceneQueryRunner({
        datasource: {
            type: 'loki',
            uid: '$ds',
        },
        queries: [
            {
                refId: 'A',
                expr: '{$stream_name="$stream_value"}',
                maxLines: 5000, // Use up to 5000
            },
        ],
    });

    const logsPanel = PanelBuilders.logs()
    .setTitle('Logs')
    .setData(logsQueryRunner);

    return new EmbeddedScene({
		$timeRange: timeRange,
		$variables: new SceneVariableSet({
			variables: [dsHandler, streamHandler, streamValueHandler],
		}),
		body: new SceneGridLayout({
			children: [
				new SceneGridItem({
					height: 8,
					width: 24,
					x: 8,
					y: 0,
					body: timeSeriesPanel.build(),
				}),
				new SceneGridItem({
					height: 20,
					width: 24,
					x: 0,
					y: 4,
					body: logsPanel.build(),
				})
			],
		}),
		controls: [
			new VariableValueSelectors({}),
			new SceneControlsSpacer(),
			new SceneTimePicker({ isOnCanvas: true }),
		],
	});
}
