# Ferusfax

Ferusfax is a command line interface that helps you with various activities in your daily life.

# Installation

Install the project globally, this will allow you to use Ferusfax on any terminal.

```bash
npm install -g @ferusfax/ferusfax
```

then run:

```bash
ferusfax
```

it will then perform the basic configurations and then show a help screen with the default commands.

# Creating a plugin

Create your project add the dependency

```bash
npm install -g @ferusfax/type
```

Extends the abstract class Plugin and implient all methods

```typescript
export default class MyPlugin extends Plugin {
  activate(args: string): string {
    ...
  }
}
```

The activate method will always be executed every time your plugin is executed.

Once your plugin has been published in your repository, simply install it using the following command

```bash
ferusfax -i
```

Follow the instructions and finally run ferusfax with the arguments given during installation

If you have any questions, run the help command

```bash
ferusfax -h
```
