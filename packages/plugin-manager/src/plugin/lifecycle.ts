import { PluginStatus } from '@ferusfax/types';
import EventEmitter from 'events';

enum EventType {
  PLUGIN_INSTALL = 'PLUGIN_INSTALL',
  PLUGIN_REMOVE = 'PLUGIN_REMOVE',
  PLUGIN_EXEC = 'PLUGIN_EXEC',
}

export class PluginEvent extends EventEmitter {
  onPluginInstall(listener = (data: PluginStatus) => {}) {
    this.on(EventType.PLUGIN_INSTALL, listener);
  }

  emitPluginInstall(status: PluginStatus) {
    this.emit(EventType.PLUGIN_INSTALL, status);
  }

  onPluginRemove(listener = (data: PluginStatus) => {}) {
    this.on(EventType.PLUGIN_REMOVE, listener);
  }

  emitPluginRemove(status: PluginStatus) {
    this.emit(EventType.PLUGIN_REMOVE, status);
  }
}

export const pluginEvent = new PluginEvent();
