import z from 'zod';
export abstract class Plugin {
  options: any;
  abstract activate(args?: string): string;
}

export const pluginSchema = z.object({
  identifier: z.object({ id: z.string(), uuid: z.string().uuid() }).optional(),
  version: z
    .string()
    .regex(new RegExp('^([0-9]+).([0-9]+).([0-9]+)$'))
    .optional(),
  location: z
    .object({
      path: z.string(),
    })
    .optional(),

  metadata: z.object({
    name: z.string(),
    packageName: z.string(),
    description: z.string(),
    option: z.string(),
    flags: z.string(),
  }),
  instance: z
    .object({
      options: z.string(),
      activate: z.function().args(z.string()),
    })
    .optional(),
  // instance: z
  //   .object({
  //     default: z.object({
  //       prototype: z.object({}),
  //     }),
  //   })
  //   .optional()
  //   .default(
  //     z.object({
  //       default: z.object({
  //         prototype: z.object({}),
  //       }),
  //     }),
  //   ),
});

export type IPlugin = z.infer<typeof pluginSchema>;

/**
 * PEDDING -> CREATED -> RESOLVED
 */
export enum PluginStatus {
  /**
   *  Wait for download and create configs
   */
  PEDDING,
  /**
   * has downloaded and created its config
   */
  CREATED,
  DISABLED,
  /**
   * The plugin is created. All the dependencies are created and resolved.
   * The plugin is ready to be started.
   */
  RESOLVED,
  UNLOADED,
  FAILED,
  REMOVED,
}

export interface PluginData {
  message: string;
}
