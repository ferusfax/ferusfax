import { PluginStatus, PluginData } from '@ferusfax/types';
import EventEmitter from 'events';

enum EventType {
  PLUGIN_INSTALL = 'PLUGIN_INSTALL',
  PLUGIN_REMOVE = 'PLUGIN_REMOVE',
  PLUGIN_EXEC = 'PLUGIN_EXEC',
}

export class PluginEvent extends EventEmitter {
  onPluginInstall(listener = (status: PluginStatus, data?: PluginData) => {}) {
    this.on(EventType.PLUGIN_INSTALL, listener);
  }

  emitPluginInstall(status: PluginStatus, data?: PluginData) {
    this.emit(EventType.PLUGIN_INSTALL, status, data);
  }

  onPluginRemove(listener = (status: PluginStatus, data?: PluginData) => {}) {
    this.on(EventType.PLUGIN_REMOVE, listener);
  }

  emitPluginRemove(status: PluginStatus, data?: PluginData) {
    this.emit(EventType.PLUGIN_REMOVE, status, data);
  }
}

export const pluginEvent = new PluginEvent();
