<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/ferusfax/ferusfax/assets/8089374/1adec062-c72c-455c-9666-c408974af19d">
    <img alt="ferusfax" src="https://github.com/ferusfax/ferusfax/assets/8089374/1adec062-c72c-455c-9666-c408974af19d" width="80">
  </picture>
</p>

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

Create your project and init your project

```bash
mkdir myplugin
cd myplugin
npm init -y
```

Install typescript

```bash
npm install --save-dev typescript
```

Create and configure the tsconfig.json file, add the dependency

```bash
npm install --save @ferusfax/types
```

Extends the abstract class Plugin and implient all methods, make shure you export as default.

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

Or can you install local project as well

Follow the instructions and finally run ferusfax with the arguments given during installation

> For local plugins you must specify this option at installation time, in this case the package name must be the path to the project.

If you have any questions, run the help command

```bash
ferusfax -h
```
