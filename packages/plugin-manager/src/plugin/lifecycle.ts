import { PluginStatus } from '@ferusfax/types';
import EventEmitter from 'events';

enum EventType {
  PLUGIN_INSTALL = 'PLUGIN_INSTALL',
  PLUGIN_EXEC = 'PLUGIN_EXEC',
}

export class PluginEvent extends EventEmitter {
  onPluginInstall(listener = (data: PluginStatus) => {}) {
    this.on(EventType.PLUGIN_INSTALL, listener);
  }

  emitPluginInstall(status: PluginStatus) {
    this.emit(EventType.PLUGIN_INSTALL, status);
  }
}

export const pluginEvent = new PluginEvent();
