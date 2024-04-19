import { IPluginManager } from '@ferusfax/plugin-manager';
import { IPlugin, PluginStatus } from '@ferusfax/types';
import { Screen } from './screen';

export function print(method: any, context: ClassMethodDecoratorContext) {
  const methodName = String(context.name);

  async function replacementMethod(this: any, ...args: any[]) {
    console.log();
    console.log();
    const result = await method.call(this, ...args);
    console.log();
    console.log();
    return result;
  }

  return replacementMethod;
}

/**
 * Listener all plugins Event
 * @returns
 */
export function onPluginEvent() {
  return onEvent(new Screen());
}

function onEvent(screen: Screen) {
  return <T, V extends IPluginManager<IPlugin>>(
    accessor: { get: (this: T) => V; set: (this: T, v: V) => void },
    context: ClassAccessorDecoratorContext<T, V>,
  ) => {
    return {
      get: function (this: T) {
        return accessor.get.call(this);
      },
      set: function (this: T, value: V) {
        accessor.set.call(this, value);

        value.onPluginInstall((status: PluginStatus) => {
          if (status == PluginStatus.PEDDING) {
            screen.start(150);
            screen.getProgressBar().update(50);
          } else if (status == PluginStatus.CREATED) {
            screen.getProgressBar().update(100);
          } else if (status == PluginStatus.RESOLVED) {
            screen.getProgressBar().update(150);
            screen.stop();
          }
        });

        value.onPluginRemove((status: PluginStatus) => {
          if (status == PluginStatus.PEDDING) {
            screen.start(100);
            screen.getProgressBar().update(50);
          } else if (status == PluginStatus.REMOVED) {
            screen.getProgressBar().update(100);
            screen.stop();
          }
        });
      },
    };
  };
}
