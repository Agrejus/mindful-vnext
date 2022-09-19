# Config Transforms

Each environment folder (local/dev/stage/prod) has an application-config.json file which contains key value pairs of environment variables.

## Overriding

To override any values or add values into the application-config.json file, send a node variable on build to the name of the variable you want, just prefix it with CONFIG_BUILDER_

For example, to override the loginUrl from the build pipeline, set CONFIG_BUILDER_LOGIN_URL to any value and it will override the default value.